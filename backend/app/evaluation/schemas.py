"""
ⒸAngelaMos | 2026
schemas.py
"""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import Field

from core.base_schema import BaseSchema


class CategoryScoreOut(BaseSchema):
    """One scored category of the report card."""
    score: float
    max: int
    evidence: str


class ScoresOut(BaseSchema):
    """The four weighted scoring categories."""
    open_source: CategoryScoreOut
    self_projects: CategoryScoreOut
    production: CategoryScoreOut
    technical_skills: CategoryScoreOut


class BonusOut(BaseSchema):
    total: float
    breakdown: str


class DeductionsOut(BaseSchema):
    total: float
    reasons: str


class EvaluationRead(BaseSchema):
    """Full evaluation report returned to the client."""
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    filename: str
    candidate_name: str | None = None
    status: str
    model_used: str
    final_score: float
    scores: ScoresOut
    bonus_points: BonusOut
    deductions: DeductionsOut
    key_strengths: list[str]
    areas_for_improvement: list[str]
    github: dict[str, Any] | None = None


class EvaluationSummary(BaseSchema):
    """Lightweight row for the history list."""
    id: UUID
    created_at: datetime
    filename: str
    candidate_name: str | None = None
    status: str
    model_used: str
    final_score: float


class EvaluationListResponse(BaseSchema):
    items: list[EvaluationSummary]
    total: int = Field(ge = 0)
    page: int = Field(ge = 1)
    size: int = Field(ge = 1)
