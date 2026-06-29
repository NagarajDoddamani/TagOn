from sqlalchemy.orm import Session
from models.payment import Payment
from typing import Optional


class PaymentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, order_id: str, screenshot_url: str = None, transaction_id: str = None) -> Payment:
        payment = Payment(order_id=order_id, screenshot_url=screenshot_url, transaction_id=transaction_id)
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def get_by_order(self, order_id: str) -> Optional[Payment]:
        return self.db.query(Payment).filter(Payment.order_id == order_id).first()

    def update_verification(self, payment: Payment, status: str, verified_by: str) -> Payment:
        from datetime import datetime, timezone
        payment.verification_status = status
        payment.verified_by = verified_by
        payment.verified_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(payment)
        return payment
