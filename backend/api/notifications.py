from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from schemas.notification import NotificationResponse
from repositories.notification_repository import NotificationRepository
from models.user import User

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = NotificationRepository(db)
    return repo.get_by_user(str(current_user.id))


@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = NotificationRepository(db)
    return {"count": repo.get_unread_count(str(current_user.id))}


@router.put("/{notification_id}/read")
def mark_as_read(notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = NotificationRepository(db)
    repo.mark_as_read(notification_id)
    return {"message": "Notification marked as read"}


@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repo = NotificationRepository(db)
    repo.mark_all_read(str(current_user.id))
    return {"message": "All notifications marked as read"}
