from sqlalchemy.orm import Session
from core.exceptions import NotFoundException, ForbiddenException
from repositories.chat_repository import ChatRepository
from repositories.notification_repository import NotificationRepository
from repositories.activity_log_repository import ActivityLogRepository
from repositories.order_repository import OrderRepository
from typing import Optional


class ChatService:
    def __init__(self, db: Session):
        self.chat_repo = ChatRepository(db)
        self.notification_repo = NotificationRepository(db)
        self.log_repo = ActivityLogRepository(db)
        self.order_repo = OrderRepository(db)

    def send_message(self, order_id: str, sender_id: str, message: Optional[str],
                     attachment_url: Optional[str] = None,
                     attachment_type: Optional[str] = None):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        if order.order_status == "payment_pending_verification":
            raise ForbiddenException("Chat is not available before payment verification")

        msg = self.chat_repo.create_message(
            order_id=order_id,
            sender_id=sender_id,
            message=message,
            attachment_url=attachment_url,
            attachment_type=attachment_type,
        )

        recipient_id = str(order.customer_id) if sender_id != str(order.customer_id) else None
        if recipient_id:
            self.notification_repo.create(
                user_id=recipient_id,
                title="New Message",
                message=f"You have a new message regarding order #{str(order.id)[:8]}",
            )
        else:
            import itertools
            from models.user import User
            admins = self.chat_repo.db.query(User).filter(User.role == "admin").all()
            for admin in admins:
                self.notification_repo.create(
                    user_id=str(admin.id),
                    title="New Message from Customer",
                    message=f"New message on order #{str(order.id)[:8]}",
                )

        self.log_repo.create(
            user_id=sender_id,
            action="chat_message",
            entity_type="order",
            entity_id=str(order.id),
            details="Message sent in order chat",
        )

        return msg

    def get_messages(self, order_id: str, current_user_id: str):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise NotFoundException("Order not found")
        self.chat_repo.mark_all_read(order_id, current_user_id)
        messages = self.chat_repo.get_messages(order_id)
        result = []
        for msg in messages:
            from models.user import User
            user = self.chat_repo.db.query(User).filter(User.id == msg.sender_id).first()
            result.append({
                "id": str(msg.id),
                "order_id": str(msg.order_id),
                "sender_id": str(msg.sender_id),
                "sender_name": user.name if user else None,
                "message": msg.message,
                "attachment_url": msg.attachment_url,
                "attachment_type": msg.attachment_type,
                "read_at": msg.read_at,
                "created_at": msg.created_at,
            })
        return result

    def mark_read(self, message_id: str):
        return self.chat_repo.mark_as_read(message_id)

    def get_unread_count(self, order_id: str, user_id: str):
        return self.chat_repo.get_unread_count(order_id, user_id)
