from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, cast, String
from models.order import Order
from models.order_status_history import OrderStatusHistory
from models.user import User
from typing import Optional, List
from utils.pagination import paginate


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> Order:
        order = Order(**data)
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_by_id(self, order_id: str) -> Optional[Order]:
        return self.db.query(Order).options(
            joinedload(Order.product),
            joinedload(Order.variant),
            joinedload(Order.template),
            joinedload(Order.payment),
        ).filter(Order.id == order_id).first()

    def get_by_customer(self, customer_id: str, status: Optional[str] = None) -> List[Order]:
        query = self.db.query(Order).filter(Order.customer_id == customer_id)
        if status:
            query = query.filter(Order.order_status == status)
        return query.order_by(Order.created_at.desc()).all()

    def get_all(self, status: Optional[str] = None, page: Optional[int] = None, per_page: int = 20):
        query = self.db.query(Order).options(joinedload(Order.customer)).order_by(Order.created_at.desc())
        if status:
            query = query.filter(Order.order_status == status)
        if page is not None:
            items, total = paginate(query, page=page, per_page=per_page)
            return items, total
        return query.all()

    def search_orders(self, search: Optional[str] = None, status: Optional[str] = None,
                      payment_status: Optional[str] = None, start_date: Optional[str] = None,
                      end_date: Optional[str] = None, min_amount: Optional[float] = None,
                      max_amount: Optional[float] = None, page: Optional[int] = None,
                      per_page: int = 20):
        query = self.db.query(Order).options(
            joinedload(Order.customer), joinedload(Order.product)
        ).order_by(Order.created_at.desc())

        if status:
            query = query.filter(Order.order_status == status)
        if payment_status:
            query = query.filter(Order.payment_status == payment_status)
        if start_date:
            query = query.filter(Order.created_at >= start_date)
        if end_date:
            query = query.filter(Order.created_at <= end_date)
        if min_amount is not None:
            query = query.filter(Order.total_amount >= min_amount)
        if max_amount is not None:
            query = query.filter(Order.total_amount <= max_amount)
        if search:
            pattern = f"%{search}%"
            query = query.filter(
                or_(
                    cast(Order.id, String).ilike(pattern),
                    Order.customer.has(User.name.ilike(pattern)),
                    Order.customer.has(User.email.ilike(pattern)),
                )
            )
        if page is not None:
            return paginate(query, page=page, per_page=per_page)
        return query.all()

    def update_status(self, order: Order, new_status: str) -> Order:
        order.order_status = new_status
        self.db.commit()
        self.db.refresh(order)
        return order


class OrderStatusHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, order_id: str, previous_status: Optional[str], new_status: str, updated_by: Optional[str] = None, remarks: Optional[str] = None) -> OrderStatusHistory:
        entry = OrderStatusHistory(
            order_id=order_id,
            previous_status=previous_status,
            new_status=new_status,
            updated_by=updated_by,
            remarks=remarks,
        )
        self.db.add(entry)
        self.db.commit()
        return entry

    def get_by_order(self, order_id: str) -> list:
        return self.db.query(OrderStatusHistory).filter(OrderStatusHistory.order_id == order_id).order_by(OrderStatusHistory.timestamp).all()
