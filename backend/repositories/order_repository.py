from sqlalchemy.orm import Session, joinedload
from models.order import Order
from models.order_status_history import OrderStatusHistory
from typing import Optional, List


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

    def get_by_customer(self, customer_id: str) -> List[Order]:
        return self.db.query(Order).filter(Order.customer_id == customer_id).order_by(Order.created_at.desc()).all()

    def get_all(self, status: Optional[str] = None) -> List[Order]:
        query = self.db.query(Order).options(joinedload(Order.customer)).order_by(Order.created_at.desc())
        if status:
            query = query.filter(Order.order_status == status)
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
