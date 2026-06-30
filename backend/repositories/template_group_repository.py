from sqlalchemy.orm import Session, joinedload
from typing import Optional
from models.template_group import TemplateGroup
from models.template import Template
from models.product import Product
from utils.pagination import paginate


class TemplateGroupRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, page: Optional[int] = None, per_page: int = 20):
        query = self.db.query(TemplateGroup).filter(TemplateGroup.is_deleted == False).order_by(TemplateGroup.created_at.desc())
        if page is not None:
            return paginate(query, page=page, per_page=per_page)
        return query.all()

    def get_by_id(self, group_id: str) -> Optional[TemplateGroup]:
        return self.db.query(TemplateGroup).filter(
            TemplateGroup.id == group_id, TemplateGroup.is_deleted == False
        ).first()

    def create(self, data: dict) -> TemplateGroup:
        group = TemplateGroup(**data)
        self.db.add(group)
        self.db.commit()
        self.db.refresh(group)
        return group

    def update(self, group: TemplateGroup, data: dict) -> TemplateGroup:
        for key, value in data.items():
            setattr(group, key, value)
        self.db.commit()
        self.db.refresh(group)
        return group

    def soft_delete(self, group: TemplateGroup):
        from datetime import datetime, timezone
        group.is_deleted = True
        group.deleted_at = datetime.now(timezone.utc)
        self.db.commit()

    def count_products(self, group_id: str) -> int:
        return self.db.query(Product).filter(
            Product.template_group_id == group_id, Product.is_deleted == False
        ).count()

    def count_templates(self, group_id: str) -> int:
        return self.db.query(Template).filter(
            Template.template_group_id == group_id, Template.is_deleted == False
        ).count()

    def get_templates(self, group_id: str) -> list:
        return self.db.query(Template).options(joinedload(Template.images)).filter(
            Template.template_group_id == group_id, Template.is_deleted == False
        ).all()
