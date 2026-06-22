"""
©AngelaMos | 2026
pipeline.py
"""

import logging
from dataclasses import dataclass

from engine.evaluator import ResumeEvaluator
from engine.models import EvaluationData, JSONResume
from engine.pdf import PDFHandler
from engine.prompt import MODEL_PARAMETERS
from engine.transform import (
    convert_github_data_to_text,
    convert_json_resume_to_text,
)

logger = logging.getLogger(__name__)

# Mirrors evaluator.py: the report card is clamped to this range.
MIN_FINAL_SCORE = -20
MAX_FINAL_SCORE = 120


class PipelineError(RuntimeError):
    """Raised when the resume cannot be evaluated by any configured model."""


@dataclass
class PipelineResult:
    evaluation: EvaluationData
    resume: JSONResume
    github: dict | None
    model_used: str
    final_score: float
    candidate_name: str | None


def _github_url(resume: JSONResume) -> str | None:
    basics = resume.basics
    if basics is None or not basics.profiles:
        return None
    for profile in basics.profiles:
        network = (profile.network or "").lower()
        url = (profile.url or "").lower()
        if "github" in network or "github.com" in url:
            return profile.url
    return None


def _final_score(evaluation: EvaluationData) -> float:
    scores = evaluation.scores
    total = (
        scores.open_source.score
        + scores.self_projects.score
        + scores.production.score
        + scores.technical_skills.score
        + evaluation.bonus_points.total
        - evaluation.deductions.total
    )
    return max(MIN_FINAL_SCORE, min(MAX_FINAL_SCORE, round(total, 2)))


def _run_once(
    pdf_path: str,
    model_name: str,
    enable_github: bool,
) -> PipelineResult:
    handler = PDFHandler(model_name=model_name)
    resume = handler.extract_json_from_pdf(pdf_path)
    if resume is None:
        raise PipelineError("Failed to extract structured data from the PDF")

    github_data: dict | None = None
    if enable_github:
        url = _github_url(resume)
        if url:
            try:
                from engine.github import fetch_and_display_github_info

                github_data = fetch_and_display_github_info(url) or None
            except Exception as exc:  # noqa: BLE001 - enrichment is best effort
                logger.warning("GitHub enrichment failed: %s", exc)
                github_data = None

    resume_text = convert_json_resume_to_text(resume)
    if github_data:
        try:
            resume_text += convert_github_data_to_text(github_data)
        except Exception as exc:  # noqa: BLE001 - best effort
            logger.warning("Failed to append GitHub context: %s", exc)

    params = MODEL_PARAMETERS.get(model_name, {"temperature": 0.5, "top_p": 0.9})
    evaluator = ResumeEvaluator(model_name=model_name, model_params=params)
    evaluation = evaluator.evaluate_resume(resume_text)

    candidate_name = resume.basics.name if resume.basics else None
    return PipelineResult(
        evaluation=evaluation,
        resume=resume,
        github=github_data,
        model_used=model_name,
        final_score=_final_score(evaluation),
        candidate_name=candidate_name,
    )


def evaluate_resume_pdf(
    pdf_path: str,
    models: list[str],
    enable_github: bool = False,
) -> PipelineResult:
    """
    Run the full extract -> (enrich) -> evaluate pipeline.

    ``models`` is an ordered preference list. The first model is tried first
    (e.g. a Gemini model); if it raises for any reason - quota, network,
    malformed output - the next model is tried (e.g. a local Ollama model).
    """
    candidates = [model for model in models if model]
    if not candidates:
        raise PipelineError("No models configured for evaluation")

    last_error: Exception | None = None
    for model_name in candidates:
        try:
            logger.info("Evaluating resume with model=%s", model_name)
            return _run_once(pdf_path, model_name, enable_github)
        except Exception as exc:  # noqa: BLE001 - try the next model
            last_error = exc
            logger.warning("Model %s failed: %s", model_name, exc)

    raise PipelineError(
        f"All configured models failed ({candidates}): {last_error}"
    ) from last_error
