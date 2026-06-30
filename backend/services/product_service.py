from sqlalchemy.orm import Session
from core.exceptions import NotFoundException, DuplicateException
from repositories.product_repository import ProductRepository, CategoryRepository, VariantRepository, TemplateRepository
from repositories.activity_log_repository import ActivityLogRepository
from typing import Optional


class ProductService:
    def __init__(self, db: Session):
        self.product_repo = ProductRepository(db)
        self.category_repo = CategoryRepository(db)
        self.variant_repo = VariantRepository(db)
        self.template_repo = TemplateRepository(db)
        self.log_repo = ActivityLogRepository(db)

    def create_category(self, name: str, description: Optional[str], admin_id: str):
        existing = self.category_repo.get_all()
        if any(c.name.lower() == name.lower() for c in existing):
            raise DuplicateException("Category already exists")
        category = self.category_repo.create(name=name, description=description)
        self.log_repo.create(
            user_id=admin_id, action="category_creation",
            entity_type="category", entity_id=str(category.id),
            details=f"Category created: {name}",
        )
        return category

    def update_category(self, category_id: str, data: dict, admin_id: str):
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundException("Category not found")
        category = self.category_repo.update(category, data)
        self.log_repo.create(
            user_id=admin_id, action="category_update",
            entity_type="category", entity_id=str(category.id),
        )
        return category

    def delete_category(self, category_id: str, admin_id: str):
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundException("Category not found")
        self.category_repo.soft_delete(category)
        self.log_repo.create(
            user_id=admin_id, action="category_delete",
            entity_type="category", entity_id=str(category.id),
        )

    def get_categories(self):
        return self.category_repo.get_all()

    def get_category(self, category_id: str):
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise NotFoundException("Category not found")
        return category

    def create_product(self, data: dict, admin_id: str):
        category = self.category_repo.get_by_id(data["category_id"])
        if not category:
            raise NotFoundException("Category not found")

        product = self.product_repo.create_product(data)
        self.log_repo.create(
            user_id=admin_id, action="product_creation",
            entity_type="product", entity_id=str(product.id),
            details=f"Product created: {product.name}",
        )
        return product

    def update_product(self, product_id: str, data: dict, admin_id: str):
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        product = self.product_repo.update_product(product, data)
        self.log_repo.create(
            user_id=admin_id, action="product_update",
            entity_type="product", entity_id=str(product.id),
        )
        return product

    def delete_product(self, product_id: str, admin_id: str):
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        self.product_repo.soft_delete(product)
        self.log_repo.create(
            user_id=admin_id, action="product_delete",
            entity_type="product", entity_id=str(product.id),
        )

    def get_products(self, category_id: Optional[str] = None, product_type: Optional[str] = None, search: Optional[str] = None):
        return self.product_repo.get_all(category_id=category_id, product_type=product_type, search=search)

    def get_product(self, product_id: str):
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        return product

    def create_variant(self, product_id: str, name: str, price: float, stock: int, image_url: Optional[str], admin_id: str):
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        variant = self.variant_repo.create(product_id=product_id, name=name, price=price, stock=stock, image_url=image_url)
        self.log_repo.create(
            user_id=admin_id, action="variant_creation",
            entity_type="variant", entity_id=str(variant.id),
        )
        return variant

    def update_variant(self, variant_id: str, data: dict, admin_id: str):
        variant = self.variant_repo.get_by_id(variant_id)
        if not variant:
            raise NotFoundException("Variant not found")
        variant = self.variant_repo.update(variant, data)
        self.log_repo.create(
            user_id=admin_id, action="variant_update",
            entity_type="variant", entity_id=str(variant.id),
        )
        return variant

    def delete_variant(self, variant_id: str, admin_id: str):
        variant = self.variant_repo.get_by_id(variant_id)
        if not variant:
            raise NotFoundException("Variant not found")
        self.variant_repo.delete(variant)
        self.log_repo.create(
            user_id=admin_id, action="variant_delete",
            entity_type="variant", entity_id=str(variant.id),
        )

    def create_template(self, product_id: str, name: str, max_upload_count: int, orientation: Optional[str], preview_image: Optional[str], admin_id: str):
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        template = self.template_repo.create(
            product_id=product_id, name=name,
            max_upload_count=max_upload_count,
            orientation=orientation, preview_image=preview_image,
        )
        self.log_repo.create(
            user_id=admin_id, action="template_creation",
            entity_type="template", entity_id=str(template.id),
        )
        return template

    def update_template(self, template_id: str, data: dict, admin_id: str):
        template = self.template_repo.get_by_id(template_id)
        if not template:
            raise NotFoundException("Template not found")
        template = self.template_repo.update(template, data)
        self.log_repo.create(
            user_id=admin_id, action="template_update",
            entity_type="template", entity_id=str(template.id),
        )
        return template

    def delete_template(self, template_id: str, admin_id: str):
        template = self.template_repo.get_by_id(template_id)
        if not template:
            raise NotFoundException("Template not found")
        self.template_repo.soft_delete(template)
        self.log_repo.create(
            user_id=admin_id, action="template_delete",
            entity_type="template", entity_id=str(template.id),
        )
