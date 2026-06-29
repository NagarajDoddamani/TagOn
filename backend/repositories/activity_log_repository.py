from sqlalchemy.orm import Session
from models.activity_log import ActivityLog
from typing import Optional


class ActivityLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: Optional[str], action: str, entity_type: Optional[str] = None, entity_id: Optional[str] = None, details: Optional[str] = None) -> ActivityLog:
        log = ActivityLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
        )
        self.db.add(log)
        self.db.commit()
        return log

    def get_all(self, limit: int = 100) -> list:
        return self.db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit).all()
