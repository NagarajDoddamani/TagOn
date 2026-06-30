from sqlalchemy.orm import Session
from models.activity_log import ActivityLog
from typing import Optional
from utils.pagination import paginate


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

    def get_all(self, limit: int = 100, page: Optional[int] = None, per_page: int = 20) -> list:
        query = self.db.query(ActivityLog).order_by(ActivityLog.timestamp.desc())
        if page is not None:
            return paginate(query, page=page, per_page=per_page)
        return query.limit(limit).all()
