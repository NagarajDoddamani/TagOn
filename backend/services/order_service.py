from typing import Optional
from sqlalchemy.orm import Session
from core.exceptions import NotFoundException, ForbiddenException
from repositories.order_repository import OrderRepository, OrderStatusHistoryRepository
from repositories.product_repository import ProductRepository, VariantRepository
from repositories.payment_repository import PaymentRepository
from repositories.notification_repository import NotificationRepository
from repositories.activity_log_repository import ActivityLogRepository
from repositories.design_repository import DesignPreviewRepository, DesignRevisionRepository
from repositories.chat_repository import ChatRepository


VALID_TRANSITIONS = {
    "payment_pending_verification": ["payment_verified", "cancelled"],
    "payment_verified": ["designing", "cancelled"],
    "designing": ["approval_pending", "cancelled"],
    "approval_pending": ["approved", "cancelled"],
    "approved": ["printing", "cancelled"],
    "printing": ["packing", "cancelled"],
    "packing": ["shipped", "cancelled"],
    "shipped": ["delivered", "cancelled"],
    "delivered": ["archived"],
    "cancelled": [],
    "archived": [],
}

STATUS_TITLES = {
    "payment_pending_verification": "Payment Pending Verification",
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


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.status_repo = OrderStatusHistoryRepository(db)
        self.product_repo = ProductRepository(db)
        self.variant_repo = VariantRepository(db)
        self.payment_repo = PaymentRepository(db)
        self.notification_repo = NotificationRepository(db)
        self.log_repo = ActivityLogRepository(db)
        self.design_preview_repo = DesignPreviewRepository(db)
        self.design_revision_repo = DesignRevisionRepository(db)
        self.chat_repo = ChatRepository(db)

    def create_order(self, customer_id: str, data: dict):
        product = self.product_repo.get_by_id(data["product_id"])
        if not product:
            raise NotFoundException("Product not found")

        total_amount = product.base_price
        if data.get("variant_id"):
            variant = self.variant_repo.get_by_id(data["variant_id"])
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

    def get_customer_orders(self, customer_id: str, status: Optional[str] = None):
        from repositories.order_repository import OrderRepository
        repo = OrderRepository(self.db)
        return repo.get_by_customer(customer_id, status=status)

    def get_all_orders(self, status: str = None, page: Optional[int] = None, per_page: int = 20):
        return self.order_repo.get_all(status=status, page=page, per_page=per_page)

    def update_order_status(self, order_id: str, new_status: str, updated_by: str, remarks: str = None):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")

        previous_status = order.order_status

        if new_status in VALID_TRANSITIONS.get(previous_status, []):
            pass
        elif new_status == "approved":
            if not self.design_revision_repo.has_approved(order_id):
                raise ForbiddenException("Customer must approve the design before marking as approved")
        elif previous_status == "approval_pending" and new_status == "designing":
            pass
        else:
            from fastapi import HTTPException
            valid = VALID_TRANSITIONS.get(previous_status, [])
            raise HTTPException(status_code=400, detail=f"Cannot transition from '{previous_status}' to '{new_status}'. Valid transitions: {valid}")

        order = self.order_repo.update_status(order, new_status)

        if new_status == "payment_verified":
            order.payment_status = "verified"

        self.db = self.order_repo.db
        self.db.commit()
        self.db.refresh(order)

        self.status_repo.create(
            order_id=str(order.id),
            previous_status=previous_status,
            new_status=new_status,
            updated_by=updated_by,
            remarks=remarks,
        )

        if new_status in STATUS_TITLES:
            self.notification_repo.create(
                user_id=str(order.customer_id),
                title=STATUS_TITLES[new_status],
                message=f"Your order #{str(order.id)[:8]} status updated to {STATUS_TITLES[new_status]}",
            )

        self.log_repo.create(
            user_id=updated_by,
            action="status_change",
            entity_type="order",
            entity_id=str(order.id),
            details=f"Status changed from {previous_status} to {new_status}",
        )

        return order

    def get_timeline(self, order_id: str):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")

        timeline = []

        status_history = self.status_repo.get_by_order(order_id)
        for h in status_history:
            timeline.append({
                "type": "status_change",
                "title": STATUS_TITLES.get(h.new_status, h.new_status.replace("_", " ").title()),
                "description": h.remarks or "",
                "timestamp": h.timestamp,
                "user_id": h.updated_by,
            })

        previews = self.design_preview_repo.get_by_order(order_id)
        for p in previews:
            timeline.append({
                "type": "design_preview",
                "title": f"Design Preview v{p.version}",
                "description": p.notes or "Design preview uploaded",
                "timestamp": p.created_at,
                "image_url": p.image_url,
            })

        revisions = self.design_revision_repo.get_by_order(order_id)
        for r in revisions:
            action_label = "Design Approved" if r.action == "approved" else "Changes Requested"
            timeline.append({
                "type": f"design_{r.action}",
                "title": action_label,
                "description": r.comments or "",
                "timestamp": r.created_at,
            })

        messages = self.chat_repo.get_messages(order_id)
        for m in messages:
            if m.message:
                preview = m.message[:80] + "..." if len(m.message) > 80 else m.message
            elif m.attachment_url:
                preview = "Attachment uploaded"
            else:
                preview = ""
            timeline.append({
                "type": "chat_message",
                "title": "Message",
                "description": preview,
                "timestamp": m.created_at,
                "user_id": str(m.sender_id),
            })

        timeline.sort(key=lambda x: x["timestamp"])

        return timeline
