from sqlalchemy.orm import Session
from models.design import DesignPreview, DesignRevision
from typing import Optional, List


class DesignPreviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, order_id: str, image_url: str, public_id: str,
               uploaded_by: str, notes: Optional[str] = None,
               version: int = 1) -> DesignPreview:
        dp = DesignPreview(
            order_id=order_id,
            image_url=image_url,
            public_id=public_id,
            uploaded_by=uploaded_by,
            notes=notes,
            version=version,
        )
        self.db.add(dp)
        self.db.commit()
        self.db.refresh(dp)
        return dp

    def get_by_order(self, order_id: str) -> List[DesignPreview]:
        return self.db.query(DesignPreview).filter(
            DesignPreview.order_id == order_id
        ).order_by(DesignPreview.version).all()

    def get_latest(self, order_id: str) -> Optional[DesignPreview]:
        return self.db.query(DesignPreview).filter(
            DesignPreview.order_id == order_id
        ).order_by(DesignPreview.version.desc()).first()

    def get_next_version(self, order_id: str) -> int:
        latest = self.get_latest(order_id)
        return (latest.version + 1) if latest else 1


class DesignRevisionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, order_id: str, customer_id: str, action: str,
               comments: Optional[str] = None,
               design_id: Optional[str] = None) -> DesignRevision:
        dr = DesignRevision(
            order_id=order_id,
            design_id=design_id,
            customer_id=customer_id,
            action=action,
            comments=comments,
        )
        self.db.add(dr)
        self.db.commit()
        self.db.refresh(dr)
        return dr

    def get_by_order(self, order_id: str) -> List[DesignRevision]:
        return self.db.query(DesignRevision).filter(
            DesignRevision.order_id == order_id
        ).order_by(DesignRevision.created_at).all()

    def has_approved(self, order_id: str) -> bool:
        return self.db.query(DesignRevision).filter(
            DesignRevision.order_id == order_id,
            DesignRevision.action == "approved",
        ).count() > 0

    def get_latest_revision(self, order_id: str) -> Optional[DesignRevision]:
        return self.db.query(DesignRevision).filter(
            DesignRevision.order_id == order_id
        ).order_by(DesignRevision.created_at.desc()).first()
