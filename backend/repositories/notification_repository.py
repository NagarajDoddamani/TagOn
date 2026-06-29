from sqlalchemy.orm import Session
from models.notification import Notification
from typing import Optional, List


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, title: str, message: str) -> Notification:
        notification = Notification(user_id=user_id, title=title, message=message)
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_by_user(self, user_id: str) -> List[Notification]:
        return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    def mark_as_read(self, notification_id: str) -> Optional[Notification]:
        notification = self.db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.status = "read"
            self.db.commit()
        return notification

    def mark_all_read(self, user_id: str) -> None:
        self.db.query(Notification).filter(Notification.user_id == user_id, Notification.status == "unread").update({"status": "read"})
        self.db.commit()

    def get_unread_count(self, user_id: str) -> int:
        return self.db.query(Notification).filter(Notification.user_id == user_id, Notification.status == "unread").count()
