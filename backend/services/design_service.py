from sqlalchemy.orm import Session
from core.exceptions import NotFoundException, ForbiddenException
from repositories.design_repository import DesignPreviewRepository, DesignRevisionRepository
from repositories.notification_repository import NotificationRepository
from repositories.activity_log_repository import ActivityLogRepository
from repositories.order_repository import OrderRepository
from typing import Optional


class DesignService:
    def __init__(self, db: Session):
        self.preview_repo = DesignPreviewRepository(db)
        self.revision_repo = DesignRevisionRepository(db)
        self.notification_repo = NotificationRepository(db)
        self.log_repo = ActivityLogRepository(db)
        self.order_repo = OrderRepository(db)

    def upload_preview(self, order_id: str, image_url: str, public_id: str,
                       uploaded_by: str, notes: Optional[str] = None):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")

        version = self.preview_repo.get_next_version(order_id)
        preview = self.preview_repo.create(
            order_id=order_id,
            image_url=image_url,
            public_id=public_id,
            uploaded_by=uploaded_by,
            notes=notes,
            version=version,
        )

        self.notification_repo.create(
            user_id=str(order.customer_id),
            title="New Design Preview",
            message=f"Design preview v{version} is ready for your order #{str(order.id)[:8]}",
        )

        self.log_repo.create(
            user_id=uploaded_by,
            action="design_preview_upload",
            entity_type="order",
            entity_id=str(order.id),
            details=f"Design preview v{version} uploaded",
        )

        return preview

    def get_previews(self, order_id: str):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        return self.preview_repo.get_by_order(order_id)

    def get_latest_preview(self, order_id: str):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        return self.preview_repo.get_latest(order_id)

    def submit_revision(self, order_id: str, customer_id: str, action: str,
                        comments: Optional[str] = None,
                        design_id: Optional[str] = None):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")

        if action not in ("approved", "changes_requested"):
            raise ValueError("Action must be 'approved' or 'changes_requested'")

        revision = self.revision_repo.create(
            order_id=order_id,
            customer_id=customer_id,
            action=action,
            comments=comments,
            design_id=design_id,
        )

        from models.user import User
        admins = self.revision_repo.db.query(User).filter(User.role == "admin").all()

        if action == "approved":
            title = "Design Approved"
            message = f"Customer approved the design for order #{str(order.id)[:8]}"
            for admin in admins:
                self.notification_repo.create(
                    user_id=str(admin.id),
                    title=title,
                    message=message,
                )
            self.notification_repo.create(
                user_id=str(order.customer_id),
                title="Design Approved",
                message=f"Your design for order #{str(order.id)[:8]} has been approved.",
            )
        else:
            title = "Revision Requested"
            message = f"Customer requested changes for order #{str(order.id)[:8]}"
            for admin in admins:
                self.notification_repo.create(
                    user_id=str(admin.id),
                    title=title,
                    message=message,
                )

        self.log_repo.create(
            user_id=customer_id,
            action=f"design_{action}",
            entity_type="order",
            entity_id=str(order.id),
            details=f"Customer {action} the design",
        )

        return revision

    def get_revisions(self, order_id: str):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        return self.revision_repo.get_by_order(order_id)

    def is_approved(self, order_id: str) -> bool:
        return self.revision_repo.has_approved(order_id)
