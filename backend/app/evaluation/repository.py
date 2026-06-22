"""
ⒸAngelaMos | 2026
repository.py
"""

from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.base_repository import BaseRepository
from .Evaluation import Evaluation


class EvaluationRepository(BaseRepository[Evaluation]):
    """Data access for resume evaluations, always scoped to a user."""
    model = Evaluation

    @classmethod
    async def get_for_user(
        cls,
        session: AsyncSession,
        evaluation_id: UUID,
        user_id: UUID,
    ) -> Evaluation | None:
        result = await session.execute(
            select(Evaluation).where(
                Evaluation.id == evaluation_id,
                Evaluation.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    @classmethod
    async def list_for_user(
        cls,
        session: AsyncSession,
        user_id: UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> Sequence[Evaluation]:
        result = await session.execute(
            select(Evaluation)
            .where(Evaluation.user_id == user_id)
            .order_by(desc(Evaluation.created_at))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    @classmethod
    async def count_for_user(
        cls,
        session: AsyncSession,
        user_id: UUID,
    ) -> int:
        result = await session.execute(
            select(func.count())
            .select_from(Evaluation)
            .where(Evaluation.user_id == user_id)
        )
        return result.scalar_one()
