from typing import Optional
from sqlalchemy.orm import Session
from core.exceptions import NotFoundException, ForbiddenException, DuplicateException
from repositories.review_repository import ReviewRepository
from repositories.activity_log_repository import ActivityLogRepository
from schemas.review import ReviewResponse, AdminReviewResponse


class ReviewService:
    def __init__(self, db: Session):
        self.repo = ReviewRepository(db)
        self.log_repo = ActivityLogRepository(db)

    def create_review(self, customer_id: str, order_id: str, rating: int, title: str, review: str) -> ReviewResponse:
        if not self.repo.order_belongs_to_customer(order_id, customer_id):
            raise NotFoundException("Order not found")
        if not self.repo.order_is_delivered(order_id):
            raise ForbiddenException("You can only review orders that have been delivered")
        existing = self.repo.get_by_order(order_id)
        if existing:
            raise DuplicateException("You have already reviewed this order")

        product_id = self.repo.get_product_id_from_order(order_id)
        if not product_id:
            raise NotFoundException("Order has no associated product")

        obj = self.repo.create(
            order_id=order_id,
            product_id=product_id,
            customer_id=customer_id,
            rating=rating,
            title=title,
            review=review,
        )

        self.log_repo.create(
            user_id=customer_id,
            action="review_creation",
            entity_type="review",
            entity_id=str(obj.id),
        )

        return self._format_response(obj)

    def get_my_reviews(self, customer_id: str) -> list:
        reviews = self.repo.get_by_customer(customer_id)
        return [self._format_response(r) for r in reviews]

    def get_latest_reviews(self, limit: int = 5) -> list:
        reviews = self.repo.get_latest_visible(limit)
        return [
            ReviewResponse(
                id=str(r.id),
                order_id=str(r.order_id),
                product_id=str(r.product_id),
                customer_id=str(r.customer_id),
                rating=r.rating,
                title=r.title,
                review=r.review,
                status=r.status,
                verified_purchase=r.verified_purchase,
                created_at=r.created_at,
                customer_name=r.customer.name if r.customer else None,
                product_name=r.product.name if r.product else None,
            )
            for r in reviews
        ]

    def get_review(self, review_id: str) -> ReviewResponse:
        review = self.repo.get_by_id(review_id)
        if not review:
            raise NotFoundException("Review not found")
        return self._format_response(review)

    def get_all_admin(self, search: Optional[str] = None, status: Optional[str] = None,
                      rating: Optional[int] = None, sort: Optional[str] = None,
                      page: Optional[int] = None, per_page: int = 20):
        result = self.repo.get_all_admin(
            search=search, status=status, rating=rating,
            sort=sort, page=page, per_page=per_page,
        )
        if page is not None:
            items, total = result
            return [
                self._format_admin_response(r) for r in items
            ], total
        return [self._format_admin_response(r) for r in result]

    def toggle_visibility(self, review_id: str) -> AdminReviewResponse:
        review = self.repo.get_by_id(review_id)
        if not review:
            raise NotFoundException("Review not found")
        new_status = "hidden" if review.status == "visible" else "visible"
        updated = self.repo.update_status(review, new_status)
        return self._format_admin_response(updated)

    def delete_review(self, review_id: str):
        review = self.repo.get_by_id(review_id)
        if not review:
            raise NotFoundException("Review not found")
        self.repo.delete(review)

    def get_customer_stats(self, customer_id: str) -> dict:
        return self.repo.get_customer_order_count(customer_id)

    def _format_response(self, r) -> ReviewResponse:
        return ReviewResponse(
            id=str(r.id),
            order_id=str(r.order_id),
            product_id=str(r.product_id),
            customer_id=str(r.customer_id),
            rating=r.rating,
            title=r.title,
            review=r.review,
            status=r.status,
            verified_purchase=r.verified_purchase,
            created_at=r.created_at,
            customer_name=r.customer.name if r.customer else None,
            product_name=r.product.name if r.product else None,
        )

    def _format_admin_response(self, r) -> AdminReviewResponse:
        return AdminReviewResponse(
            id=str(r.id),
            order_id=str(r.order_id),
            product_id=str(r.product_id),
            customer_id=str(r.customer_id),
            rating=r.rating,
            title=r.title,
            review=r.review,
            status=r.status,
            verified_purchase=r.verified_purchase,
            created_at=r.created_at,
            updated_at=r.updated_at,
            customer_name=r.customer.name if r.customer else None,
            customer_email=r.customer.email if r.customer else None,
            product_name=r.product.name if r.product else None,
        )
