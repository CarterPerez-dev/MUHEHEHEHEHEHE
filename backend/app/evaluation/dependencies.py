"""
ⒸAngelaMos | 2026
dependencies.py
"""

from typing import Annotated

from fastapi import Depends

from core.dependencies import DBSession
from .service import EvaluationService


def get_evaluation_service(db: DBSession) -> EvaluationService:
    """Dependency to inject an EvaluationService instance."""
    return EvaluationService(db)


EvaluationServiceDep = Annotated[
    EvaluationService,
    Depends(get_evaluation_service),
]
