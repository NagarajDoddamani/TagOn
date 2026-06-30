from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from core.security import get_current_user, require_admin
from models.user import User
from schemas.review import ReviewCreate, ReviewResponse, AdminReviewResponse
from services.review_service import ReviewService
from utils.pagination import build_paginated_response

router = APIRouter(tags=["Reviews"])


@router.get("/api/reviews/latest")
def get_latest_reviews(limit: int = Query(5, ge=1, le=20), db: Session = Depends(get_db)):
    service = ReviewService(db)
    return service.get_latest_reviews(limit)


@router.get("/api/reviews/my", response_model=list[ReviewResponse])
def get_my_reviews(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = ReviewService(db)
    return service.get_my_reviews(str(current_user.id))


@router.post("/api/reviews", response_model=ReviewResponse)
def create_review(
    request: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReviewService(db)
    return service.create_review(
        customer_id=str(current_user.id),
        order_id=request.order_id,
        rating=request.rating,
        title=request.title,
        review=request.review,
    )


@router.get("/api/reviews/{review_id}", response_model=ReviewResponse)
def get_review(review_id: str, db: Session = Depends(get_db)):
    service = ReviewService(db)
    return service.get_review(review_id)


@router.get("/api/admin/reviews")
def get_admin_reviews(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    rating: Optional[int] = Query(None, ge=1, le=5),
    sort: Optional[str] = Query(None, pattern="^(rating_asc|rating_desc|newest|oldest)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ReviewService(db)
    items, total = service.get_all_admin(
        search=search, status=status, rating=rating,
        sort=sort, page=page, per_page=per_page,
    )
    return build_paginated_response(items, total, page, per_page)


@router.put("/api/admin/reviews/{review_id}/visibility")
def toggle_review_visibility(
    review_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ReviewService(db)
    return service.toggle_visibility(review_id)


@router.delete("/api/admin/reviews/{review_id}")
def delete_review(
    review_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ReviewService(db)
    service.delete_review(review_id)
    return {"message": "Review deleted successfully"}


@router.get("/api/profile/stats")
def get_profile_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReviewService(db)
    return service.get_customer_stats(str(current_user.id))
