from sqlalchemy.orm import Session
from core.exceptions import NotFoundException, ForbiddenException, DuplicateException
from core.cloudinary import upload_image
from repositories.template_group_repository import TemplateGroupRepository
from repositories.product_repository import TemplateRepository, TemplateImageRepository
from repositories.activity_log_repository import ActivityLogRepository


class TemplateGroupService:
    def __init__(self, db: Session):
        self.group_repo = TemplateGroupRepository(db)
        self.template_repo = TemplateRepository(db)
        self.template_image_repo = TemplateImageRepository(db)
        self.log_repo = ActivityLogRepository(db)

    def get_groups(self, page=None, per_page=20):
        return self.group_repo.get_all(page=page, per_page=per_page)

    def get_group(self, group_id: str):
        group = self.group_repo.get_by_id(group_id)
        if not group:
            raise NotFoundException("Template group not found")
        return group

    def create_group(self, data: dict, admin_id: str):
        existing = self.group_repo.get_all()
        if any(g.name.lower() == data["name"].lower() for g in existing):
            raise DuplicateException("Template group with this name already exists")
        group = self.group_repo.create(data)
        self.log_repo.create(
            user_id=admin_id, action="template_group_creation",
            entity_type="template_group", entity_id=str(group.id),
            details=f"Template group created: {group.name}",
        )
        return group

    def update_group(self, group_id: str, data: dict, admin_id: str):
        group = self.group_repo.get_by_id(group_id)
        if not group:
            raise NotFoundException("Template group not found")
        group = self.group_repo.update(group, data)
        self.log_repo.create(
            user_id=admin_id, action="template_group_update",
            entity_type="template_group", entity_id=str(group.id),
        )
        return group

    def delete_group(self, group_id: str, admin_id: str):
        group = self.group_repo.get_by_id(group_id)
        if not group:
            raise NotFoundException("Template group not found")
        product_count = self.group_repo.count_products(group_id)
        if product_count > 0:
            raise ForbiddenException(f"Cannot delete: {product_count} product(s) reference this group")
        template_count = self.group_repo.count_templates(group_id)
        if template_count > 0:
            raise ForbiddenException(f"Cannot delete: {template_count} template(s) exist in this group. Remove or reassign them first.")
        self.group_repo.soft_delete(group)
        self.log_repo.create(
            user_id=admin_id, action="template_group_delete",
            entity_type="template_group", entity_id=str(group.id),
        )

    def get_templates(self, group_id: str):
        group = self.group_repo.get_by_id(group_id)
        if not group:
            raise NotFoundException("Template group not found")
        return self.group_repo.get_templates(group_id)

    def create_template_from_image(self, group_id: str, name: str, image_file, file_bytes: bytes, max_upload_count: int, admin_id: str):
        group = self.group_repo.get_by_id(group_id)
        if not group:
            raise NotFoundException("Template group not found")
        template = self.template_repo.create(
            template_group_id=group_id,
            name=name,
            max_upload_count=max_upload_count,
        )
        image_file.file.seek(0)
        result = upload_image(image_file, folder="tagon/templates")
        self.template_image_repo.create_many(str(template.id), [result["url"]])
        template = self.template_repo.get_by_id(str(template.id))
        self.log_repo.create(
            user_id=admin_id, action="template_batch_creation",
            entity_type="template", entity_id=str(template.id),
            details=f"Template created from image: {name} in group {group.name}",
        )
        return template
