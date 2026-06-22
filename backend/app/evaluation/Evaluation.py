"""
ⒸAngelaMos | 2026
Evaluation.py
"""

from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from core.Base import Base, TimestampMixin, UUIDMixin


class Evaluation(Base, UUIDMixin, TimestampMixin):
    """
    A single resume evaluation produced by the hiring-agent engine.

    The full structured report (category scores, bonus, deductions,
    strengths, improvements and optional GitHub enrichment) is stored
    verbatim in ``result`` so the original engine output is never lost.
    """
    __tablename__ = "evaluations"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete = "CASCADE"),
        index = True,
    )

    filename: Mapped[str] = mapped_column(String(255))
    candidate_name: Mapped[str | None] = mapped_column(
        String(255),
        default = None,
    )

    status: Mapped[str] = mapped_column(String(20), default = "completed")
    model_used: Mapped[str] = mapped_column(String(64))
    final_score: Mapped[float] = mapped_column(Float)

    result: Mapped[dict[str, Any]] = mapped_column(JSONB)
