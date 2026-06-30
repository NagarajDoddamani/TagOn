from typing import Optional
from sqlalchemy.orm import Session, joinedload
from models.review import Review
from models.order import Order
from models.product import Product
from models.user import User
from utils.pagination import paginate


class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, order_id: str, product_id: str, customer_id: str, rating: int, title: str, review: str) -> Review:
        obj = Review(
            order_id=order_id,
            product_id=product_id,
            customer_id=customer_id,
            rating=rating,
            title=title,
            review=review,
        )
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get_by_id(self, review_id: str) -> Optional[Review]:
        return self.db.query(Review).options(
            joinedload(Review.customer),
            joinedload(Review.product),
        ).filter(Review.id == review_id).first()

    def get_by_order(self, order_id: str) -> Optional[Review]:
        return self.db.query(Review).filter(Review.order_id == order_id).first()

    def get_by_customer(self, customer_id: str) -> list:
        return self.db.query(Review).options(
            joinedload(Review.product),
        ).filter(
            Review.customer_id == customer_id,
        ).order_by(Review.created_at.desc()).all()

    def get_latest_visible(self, limit: int = 5) -> list:
        return self.db.query(Review).options(
            joinedload(Review.customer),
            joinedload(Review.product),
        ).filter(
            Review.status == "visible",
        ).order_by(Review.created_at.desc()).limit(limit).all()

    def get_all_admin(self, search: Optional[str] = None, status: Optional[str] = None,
                      rating: Optional[int] = None, sort: Optional[str] = None,
                      page: Optional[int] = None, per_page: int = 20):
        query = self.db.query(Review).options(
            joinedload(Review.customer),
            joinedload(Review.product),
        )

        if status:
            query = query.filter(Review.status == status)
        if rating:
            query = query.filter(Review.rating == rating)
        if search:
            pattern = f"%{search}%"
            query = query.filter(
                Review.title.ilike(pattern) | Review.review.ilike(pattern)
            )

        if sort == "rating_asc":
            query = query.order_by(Review.rating.asc())
        elif sort == "rating_desc":
            query = query.order_by(Review.rating.desc())
        elif sort == "oldest":
            query = query.order_by(Review.created_at.asc())
        else:
            query = query.order_by(Review.created_at.desc())

        if page is not None:
            return paginate(query, page=page, per_page=per_page)
        return query.all()

    def update_status(self, review: Review, status: str) -> Review:
        review.status = status
        self.db.commit()
        self.db.refresh(review)
        return review

    def delete(self, review: Review):
        self.db.delete(review)
        self.db.commit()

    def order_is_delivered(self, order_id: str) -> bool:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        return order is not None and order.order_status == "delivered"

    def order_belongs_to_customer(self, order_id: str, customer_id: str) -> bool:
        order = self.db.query(Order).filter(
            Order.id == order_id,
            Order.customer_id == customer_id,
        ).first()
        return order is not None

    def get_product_id_from_order(self, order_id: str) -> Optional[str]:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        return str(order.product_id) if order else None

    def get_customer_order_count(self, customer_id: str) -> dict:
        all_orders = self.db.query(Order).filter(
            Order.customer_id == customer_id,
        ).count()
        active = self.db.query(Order).filter(
            Order.customer_id == customer_id,
            Order.order_status.in_([
                "payment_pending_verification", "payment_verified", "designing",
                "approval_pending", "approved", "printing", "packing", "shipped",
            ]),
        ).count()
        delivered = self.db.query(Order).filter(
            Order.customer_id == customer_id,
            Order.order_status == "delivered",
        ).count()
        cancelled = self.db.query(Order).filter(
            Order.customer_id == customer_id,
            Order.order_status == "cancelled",
        ).count()
        return {
            "total_orders": all_orders,
            "active_orders": active,
            "delivered_orders": delivered,
            "cancelled_orders": cancelled,
        }
