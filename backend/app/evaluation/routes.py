"""
ⒸAngelaMos | 2026
routes.py
"""

from uuid import UUID

from fastapi import (
    APIRouter,
    File,
    Query,
    Request,
    Response,
    UploadFile,
    status,
)

from config import settings
from core.dependencies import CurrentUser
from core.rate_limit import limiter
from core.responses import AUTH_401, NOT_FOUND_404
from .dependencies import EvaluationServiceDep
from .schemas import (
    EvaluationListResponse,
    EvaluationRead,
)


router = APIRouter(prefix = "/evaluations", tags = ["evaluations"])


@router.post(
    "",
    response_model = EvaluationRead,
    status_code = status.HTTP_201_CREATED,
    responses = {**AUTH_401},
)
@limiter.limit(settings.RATE_LIMIT_EVALUATE)
async def create_evaluation(
    request: Request,
    response: Response,
    evaluation_service: EvaluationServiceDep,
    current_user: CurrentUser,
    file: UploadFile = File(...),
) -> EvaluationRead:
    """
    Upload a resume PDF and run it through the hiring-agent engine.
    """
    return await evaluation_service.create_from_pdf(current_user, file)


@router.get(
    "",
    response_model = EvaluationListResponse,
    responses = {**AUTH_401},
)
async def list_evaluations(
    evaluation_service: EvaluationServiceDep,
    current_user: CurrentUser,
    page: int = Query(1, ge = 1),
    size: int = Query(20, ge = 1, le = 100),
) -> EvaluationListResponse:
    """
    List the current user's past evaluations, newest first.
    """
    return await evaluation_service.list(current_user, page, size)


@router.get(
    "/{evaluation_id}",
    response_model = EvaluationRead,
    responses = {**AUTH_401, **NOT_FOUND_404},
)
async def get_evaluation(
    evaluation_service: EvaluationServiceDep,
    current_user: CurrentUser,
    evaluation_id: UUID,
) -> EvaluationRead:
    """
    Fetch a single evaluation report.
    """
    return await evaluation_service.get(current_user, evaluation_id)


@router.delete(
    "/{evaluation_id}",
    status_code = status.HTTP_204_NO_CONTENT,
    responses = {**AUTH_401, **NOT_FOUND_404},
)
async def delete_evaluation(
    evaluation_service: EvaluationServiceDep,
    current_user: CurrentUser,
    evaluation_id: UUID,
) -> None:
    """
    Delete an evaluation owned by the current user.
    """
    await evaluation_service.delete(current_user, evaluation_id)
