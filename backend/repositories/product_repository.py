from sqlalchemy.orm import Session, joinedload
from models.product import Product
from models.category import Category
from models.product_variant import ProductVariant
from models.template import Template
from typing import Optional, List


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_product(self, data: dict) -> Product:
        product = Product(**data)
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update_product(self, product: Product, data: dict) -> Product:
        for key, value in data.items():
            setattr(product, key, value)
        self.db.commit()
        self.db.refresh(product)
        return product

    def soft_delete(self, product: Product) -> Product:
        from datetime import datetime, timezone
        product.is_deleted = True
        product.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        return product

    def get_by_id(self, product_id: str) -> Product:
        return self.db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.variants),
            joinedload(Product.templates),
        ).filter(Product.id == product_id, Product.is_deleted == False).first()

    def get_all(self, category_id: Optional[str] = None, product_type: Optional[str] = None, search: Optional[str] = None) -> List[Product]:
        query = self.db.query(Product).options(joinedload(Product.category)).filter(Product.is_deleted == False)
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if product_type:
            query = query.filter(Product.product_type == product_type)
        if search:
            query = query.filter(Product.name.ilike(f"%{search}%"))
        return query.all()


class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, name: str, description: str = None) -> Category:
        category = Category(name=name, description=description)
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update(self, category: Category, data: dict) -> Category:
        for key, value in data.items():
            setattr(category, key, value)
        self.db.commit()
        self.db.refresh(category)
        return category

    def soft_delete(self, category: Category) -> Category:
        from datetime import datetime, timezone
        category.is_deleted = True
        category.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        return category

    def get_by_id(self, category_id: str) -> Category:
        return self.db.query(Category).filter(Category.id == category_id, Category.is_deleted == False).first()

    def get_all(self) -> list:
        return self.db.query(Category).filter(Category.is_deleted == False).all()


class VariantRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, product_id: str, name: str, price: float, stock: int = 0, image_url: str = None) -> ProductVariant:
        variant = ProductVariant(product_id=product_id, name=name, price=price, stock=stock, image_url=image_url)
        self.db.add(variant)
        self.db.commit()
        self.db.refresh(variant)
        return variant

    def update(self, variant: ProductVariant, data: dict) -> ProductVariant:
        for key, value in data.items():
            setattr(variant, key, value)
        self.db.commit()
        self.db.refresh(variant)
        return variant

    def get_by_id(self, variant_id: str) -> ProductVariant:
        return self.db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

    def get_by_product(self, product_id: str) -> list:
        return self.db.query(ProductVariant).filter(ProductVariant.product_id == product_id).all()

    def delete(self, variant: ProductVariant) -> None:
        self.db.delete(variant)
        self.db.commit()


class TemplateRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, product_id: str, name: str, max_upload_count: int = 1, orientation: str = None, preview_image: str = None) -> Template:
        template = Template(
            product_id=product_id, name=name,
            max_upload_count=max_upload_count,
            orientation=orientation, preview_image=preview_image,
        )
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template

    def update(self, template: Template, data: dict) -> Template:
        for key, value in data.items():
            setattr(template, key, value)
        self.db.commit()
        self.db.refresh(template)
        return template

    def soft_delete(self, template: Template) -> Template:
        from datetime import datetime, timezone
        template.is_deleted = True
        template.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        return template

    def get_by_id(self, template_id: str) -> Template:
        return self.db.query(Template).filter(Template.id == template_id, Template.is_deleted == False).first()

    def get_by_product(self, product_id: str) -> list:
        return self.db.query(Template).filter(Template.product_id == product_id, Template.is_deleted == False).all()
