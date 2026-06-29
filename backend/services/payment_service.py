from sqlalchemy.orm import Session
from core.exceptions import NotFoundException
from repositories.payment_repository import PaymentRepository
from repositories.order_repository import OrderRepository, OrderStatusHistoryRepository
from repositories.notification_repository import NotificationRepository
from repositories.activity_log_repository import ActivityLogRepository


class PaymentService:
    def __init__(self, db: Session):
        self.payment_repo = PaymentRepository(db)
        self.order_repo = OrderRepository(db)
        self.status_repo = OrderStatusHistoryRepository(db)
        self.notification_repo = NotificationRepository(db)
        self.log_repo = ActivityLogRepository(db)

    def upload_payment(self, order_id: str, screenshot_url: str, transaction_id: str = None):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")

        existing = self.payment_repo.get_by_order(order_id)
        if existing:
            existing.screenshot_url = screenshot_url
            existing.transaction_id = transaction_id
            self.payment_repo.db.commit()
            return existing

        payment = self.payment_repo.create(order_id=order_id, screenshot_url=screenshot_url, transaction_id=transaction_id)

        self.notification_repo.create(
            user_id=str(order.customer_id),
            title="Payment Submitted",
            message=f"Payment screenshot for order #{str(order.id)[:8]} has been submitted.",
        )

        self.log_repo.create(
            user_id=str(order.customer_id),
            action="payment_upload",
            entity_type="payment",
            entity_id=str(payment.id),
            details=f"Payment uploaded for order {str(order.id)[:8]}",
        )

        return payment

    def get_payment(self, order_id: str):
        payment = self.payment_repo.get_by_order(order_id)
        if not payment:
            raise NotFoundException("Payment not found")
        return payment

    def verify_payment(self, order_id: str, status: str, verified_by: str, remarks: str = None):
        payment = self.payment_repo.get_by_order(order_id)
        if not payment:
            raise NotFoundException("Payment not found")

        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")

        payment = self.payment_repo.update_verification(payment, status, verified_by)

        if status == "verified":
            previous_status = order.order_status
            order = self.order_repo.update_status(order, "payment_verified")
            order.payment_status = "paid"

            self.status_repo.create(
                order_id=str(order.id),
                previous_status=previous_status,
                new_status="payment_verified",
                updated_by=verified_by,
                remarks=remarks,
            )

            self.notification_repo.create(
                user_id=str(order.customer_id),
                title="Payment Verified",
                message=f"Your payment for order #{str(order.id)[:8]} has been verified.",
            )
        else:
            self.notification_repo.create(
                user_id=str(order.customer_id),
                title="Payment Rejected",
                message=f"Your payment for order #{str(order.id)[:8]} has been rejected.",
            )
            order.payment_status = "rejected"

        self.log_repo.create(
            user_id=verified_by,
            action="payment_verification",
            entity_type="payment",
            entity_id=str(payment.id),
            details=f"Payment verification: {status}",
        )

        return payment
