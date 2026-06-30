from sqlalchemy.orm import Session
from models.chat_message import ChatMessage
from typing import Optional, List


class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_message(self, order_id: str, sender_id: str, message: Optional[str],
                       attachment_url: Optional[str] = None,
                       attachment_type: Optional[str] = None) -> ChatMessage:
        msg = ChatMessage(
            order_id=order_id,
            sender_id=sender_id,
            message=message,
            attachment_url=attachment_url,
            attachment_type=attachment_type,
        )
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def get_messages(self, order_id: str) -> List[ChatMessage]:
        return self.db.query(ChatMessage).filter(
            ChatMessage.order_id == order_id
        ).order_by(ChatMessage.created_at).all()

    def mark_as_read(self, message_id: str) -> Optional[ChatMessage]:
        from datetime import datetime, timezone
        msg = self.db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
        if msg and not msg.read_at:
            msg.read_at = datetime.now(timezone.utc)
            self.db.commit()
        return msg

    def mark_all_read(self, order_id: str, user_id: str) -> None:
        from datetime import datetime, timezone
        self.db.query(ChatMessage).filter(
            ChatMessage.order_id == order_id,
            ChatMessage.sender_id != user_id,
            ChatMessage.read_at.is_(None),
        ).update({"read_at": datetime.now(timezone.utc)})
        self.db.commit()

    def get_unread_count(self, order_id: str, user_id: str) -> int:
        return self.db.query(ChatMessage).filter(
            ChatMessage.order_id == order_id,
            ChatMessage.sender_id != user_id,
            ChatMessage.read_at.is_(None),
        ).count()
