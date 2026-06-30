import math
from pydantic import BaseModel
from typing import Generic, TypeVar, Sequence

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool


def paginate(query, page: int = 1, per_page: int = 20):
    """Apply offset/limit to a SQLAlchemy query and return (items, total_count)."""
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 20
    if per_page > 100:
        per_page = 100

    total = query.count()
    offset = (page - 1) * per_page
    items = query.offset(offset).limit(per_page).all()

    return items, total


def build_paginated_response(items: Sequence, total: int, page: int, per_page: int) -> dict:
    """Build a paginated response dict matching PaginatedResponse schema."""
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, math.ceil(total / per_page)) if total > 0 else 1,
        "has_next": (page * per_page) < total,
        "has_prev": page > 1,
    }
