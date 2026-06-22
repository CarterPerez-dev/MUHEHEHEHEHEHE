"""
ⒸAngelaMos | 2026
service.py
"""

import asyncio
import logging
import os
import tempfile
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from core.exceptions import ResourceNotFound, ValidationError
from engine.pipeline import PipelineError, PipelineResult, evaluate_resume_pdf
from user.User import User
from .Evaluation import Evaluation
from .repository import EvaluationRepository
from .schemas import (
    EvaluationListResponse,
    EvaluationRead,
    EvaluationSummary,
)

logger = logging.getLogger(__name__)

_PDF_MAGIC = b"%PDF"


class EvaluationService:
    """Business logic for resume evaluations."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_from_pdf(
        self,
        user: User,
        file: UploadFile,
    ) -> EvaluationRead:
        """
        Validate the upload, run the hiring-agent pipeline off the event
        loop, persist the report and return it.
        """
        filename = (file.filename or "resume.pdf").strip()[:255]
        content = await file.read()

        max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
        if len(content) == 0:
            raise ValidationError("The uploaded file is empty")
        if len(content) > max_bytes:
            raise ValidationError(
                f"File exceeds the {settings.MAX_UPLOAD_MB}MB limit"
            )
        if not content.startswith(_PDF_MAGIC):
            raise ValidationError("Only PDF resumes are supported")

        result = await asyncio.to_thread(self._run_engine, content)

        payload = result.evaluation.model_dump()
        payload["github"] = result.github

        row = await EvaluationRepository.create(
            self.session,
            user_id = user.id,
            filename = filename,
            candidate_name = result.candidate_name,
            status = "completed",
            model_used = result.model_used,
            final_score = result.final_score,
            result = payload,
        )
        return self._to_read(row)

    def _run_engine(self, content: bytes) -> PipelineResult:
        """Blocking pipeline call - runs in a worker thread."""
        tmp_path = ""
        try:
            with tempfile.NamedTemporaryFile(
                suffix = ".pdf",
                delete = False,
            ) as tmp:
                tmp.write(content)
                tmp_path = tmp.name

            try:
                return evaluate_resume_pdf(
                    tmp_path,
                    models = [settings.PRIMARY_MODEL, settings.FALLBACK_MODEL],
                    enable_github = settings.GITHUB_ENRICHMENT,
                )
            except PipelineError as exc:
                logger.error("Evaluation pipeline failed: %s", exc)
                raise ValidationError(
                    "We could not evaluate this resume. Make sure it is a "
                    "real, text-based PDF resume and try again."
                ) from exc
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)

    async def list(
        self,
        user: User,
        page: int,
        size: int,
    ) -> EvaluationListResponse:
        skip = (page - 1) * size
        rows = await EvaluationRepository.list_for_user(
            self.session,
            user_id = user.id,
            skip = skip,
            limit = size,
        )
        total = await EvaluationRepository.count_for_user(
            self.session,
            user_id = user.id,
        )
        return EvaluationListResponse(
            items = [EvaluationSummary.model_validate(row) for row in rows],
            total = total,
            page = page,
            size = size,
        )

    async def get(
        self,
        user: User,
        evaluation_id: UUID,
    ) -> EvaluationRead:
        row = await self._get_owned(user, evaluation_id)
        return self._to_read(row)

    async def delete(
        self,
        user: User,
        evaluation_id: UUID,
    ) -> None:
        row = await self._get_owned(user, evaluation_id)
        await EvaluationRepository.delete(self.session, row)

    async def _get_owned(
        self,
        user: User,
        evaluation_id: UUID,
    ) -> Evaluation:
        row = await EvaluationRepository.get_for_user(
            self.session,
            evaluation_id = evaluation_id,
            user_id = user.id,
        )
        if row is None:
            raise ResourceNotFound("Evaluation", str(evaluation_id))
        return row

    @staticmethod
    def _to_read(row: Evaluation) -> EvaluationRead:
        data = dict(row.result)
        return EvaluationRead(
            id = row.id,
            created_at = row.created_at,
            updated_at = row.updated_at,
            filename = row.filename,
            candidate_name = row.candidate_name,
            status = row.status,
            model_used = row.model_used,
            final_score = row.final_score,
            scores = data["scores"],
            bonus_points = data["bonus_points"],
            deductions = data["deductions"],
            key_strengths = data.get("key_strengths", []),
            areas_for_improvement = data.get("areas_for_improvement", []),
            github = data.get("github"),
        )
