from sqlalchemy.orm import Session
from core.exceptions import NotFoundException
from repositories.order_repository import OrderRepository, OrderStatusHistoryRepository
from repositories.product_repository import ProductRepository
from repositories.payment_repository import PaymentRepository
from repositories.notification_repository import NotificationRepository
from repositories.activity_log_repository import ActivityLogRepository


class OrderService:
    def __init__(self, db: Session):
        self.order_repo = OrderRepository(db)
        self.status_repo = OrderStatusHistoryRepository(db)
        self.product_repo = ProductRepository(db)
        self.payment_repo = PaymentRepository(db)
        self.notification_repo = NotificationRepository(db)
        self.log_repo = ActivityLogRepository(db)

    def create_order(self, customer_id: str, data: dict):
        product = self.product_repo.get_by_id(data["product_id"])
        if not product:
            raise NotFoundException("Product not found")

        total_amount = product.base_price
        if data.get("variant_id"):
            variant = self.product_repo.variant_repo.get_by_id(data["variant_id"])
            if variant:
                total_amount = variant.price

        total_amount *= data.get("quantity", 1)

        order_data = {
            "customer_id": customer_id,
            "product_id": data["product_id"],
            "variant_id": data.get("variant_id"),
            "template_id": data.get("template_id"),
            "quantity": data.get("quantity", 1),
            "total_amount": total_amount,
            "payment_status": "pending",
            "order_status": "payment_pending_verification",
            "delivery_address": data["delivery_address"],
            "customization_notes": data.get("customization_notes"),
            "is_customized": product.product_type == "customized" or product.customizable,
            "uploaded_images": data.get("uploaded_images"),
        }

        order = self.order_repo.create(order_data)

        self.status_repo.create(
            order_id=str(order.id),
            previous_status=None,
            new_status="payment_pending_verification",
        )

        self.notification_repo.create(
            user_id=customer_id,
            title="Order Submitted",
            message=f"Your order #{str(order.id)[:8]} has been submitted successfully.",
        )

        self.log_repo.create(
            user_id=customer_id,
            action="order_creation",
            entity_type="order",
            entity_id=str(order.id),
            details=f"Order created for product: {product.name}",
        )

        return order

    def get_order(self, order_id: str):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        return order

    def get_customer_orders(self, customer_id: str):
        return self.order_repo.get_by_customer(customer_id)

    def get_all_orders(self, status: str = None):
        return self.order_repo.get_all(status=status)

    def update_order_status(self, order_id: str, new_status: str, updated_by: str, remarks: str = None):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")

        previous_status = order.order_status
        order = self.order_repo.update_status(order, new_status)

        self.status_repo.create(
            order_id=str(order.id),
            previous_status=previous_status,
            new_status=new_status,
            updated_by=updated_by,
            remarks=remarks,
        )

        status_titles = {
            "payment_verified": "Payment Verified",
            "designing": "Designing Started",
            "approval_pending": "Design Ready for Review",
            "approved": "Design Approved",
            "printing": "Printing Started",
            "packing": "Packing Started",
            "shipped": "Order Shipped",
            "delivered": "Order Delivered",
            "cancelled": "Order Cancelled",
            "archived": "Order Archived",
        }

        if new_status in status_titles:
            self.notification_repo.create(
                user_id=str(order.customer_id),
                title=status_titles[new_status],
                message=f"Your order #{str(order.id)[:8]} status updated to {status_titles[new_status]}",
            )

        self.log_repo.create(
            user_id=updated_by,
            action="status_change",
            entity_type="order",
            entity_id=str(order.id),
            details=f"Status changed from {previous_status} to {new_status}",
        )

        return order
