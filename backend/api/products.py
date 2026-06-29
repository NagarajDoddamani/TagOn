from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from core.security import get_current_user, require_admin
from core.cloudinary import upload_image
from schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    CategoryCreate, CategoryResponse, VariantCreate, VariantResponse,
    TemplateCreate, TemplateResponse,
)
from services.product_service import ProductService
from models.user import User

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.post("/categories", response_model=CategoryResponse)
def create_category(request: CategoryCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = ProductService(db)
    return service.create_category(name=request.name, description=request.description, admin_id=str(admin.id))


@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.get_categories()


@router.get("/categories/{category_id}", response_model=CategoryResponse)
def get_category(category_id: str, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.get_category(category_id)


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: str, request: CategoryCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = ProductService(db)
    return service.update_category(category_id, request.model_dump(exclude_unset=True), admin_id=str(admin.id))


@router.delete("/categories/{category_id}")
def delete_category(category_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = ProductService(db)
    service.delete_category(category_id, admin_id=str(admin.id))
    return {"message": "Category deleted successfully"}


@router.post("", response_model=ProductResponse)
def create_product(
    category_id: str = Form(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    base_price: float = Form(...),
    product_type: str = Form(...),
    customizable: bool = Form(False),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    image_url = None
    if image:
        result = upload_image(image, folder="tagon/products")
        image_url = result["url"]

    data = {
        "category_id": category_id,
        "name": name,
        "description": description,
        "base_price": base_price,
        "product_type": product_type,
        "customizable": customizable,
        "image_url": image_url,
    }
    service = ProductService(db)
    return service.create_product(data, admin_id=str(admin.id))


@router.get("", response_model=list[ProductListResponse])
def get_products(
    category_id: Optional[str] = None,
    product_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    return service.get_products(category_id=category_id, product_type=product_type, search=search)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.get_product(product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    base_price: Optional[float] = Form(None),
    product_type: Optional[str] = Form(None),
    customizable: Optional[bool] = Form(None),
    status: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    data = {}
    if name is not None:
        data["name"] = name
    if description is not None:
        data["description"] = description
    if base_price is not None:
        data["base_price"] = base_price
    if product_type is not None:
        data["product_type"] = product_type
    if customizable is not None:
        data["customizable"] = customizable
    if status is not None:
        data["status"] = status
    if image:
        result = upload_image(image, folder="tagon/products")
        data["image_url"] = result["url"]

    service = ProductService(db)
    return service.update_product(product_id, data, admin_id=str(admin.id))


@router.delete("/{product_id}")
def delete_product(product_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = ProductService(db)
    service.delete_product(product_id, admin_id=str(admin.id))
    return {"message": "Product deleted successfully"}


@router.post("/{product_id}/variants", response_model=VariantResponse)
def create_variant(
    product_id: str,
    request: VariantCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ProductService(db)
    return service.create_variant(
        product_id=product_id, name=request.name, price=request.price,
        stock=request.stock, image_url=request.image_url, admin_id=str(admin.id),
    )


@router.get("/{product_id}/variants", response_model=list[VariantResponse])
def get_variants(product_id: str, db: Session = Depends(get_db)):
    service = ProductService(db)
    from repositories.product_repository import VariantRepository
    return VariantRepository(db).get_by_product(product_id)


@router.post("/{product_id}/templates", response_model=TemplateResponse)
def create_template(
    product_id: str,
    name: str = Form(...),
    max_upload_count: int = Form(1),
    orientation: Optional[str] = Form(None),
    preview_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    image_url = None
    if preview_image:
        result = upload_image(preview_image, folder="tagon/templates")
        image_url = result["url"]

    service = ProductService(db)
    return service.create_template(
        product_id=product_id, name=name,
        max_upload_count=max_upload_count,
        orientation=orientation, preview_image=image_url,
        admin_id=str(admin.id),
    )


@router.get("/{product_id}/templates", response_model=list[TemplateResponse])
def get_templates(product_id: str, db: Session = Depends(get_db)):
    service = ProductService(db)
    from repositories.product_repository import TemplateRepository
    return TemplateRepository(db).get_by_product(product_id)


@router.put("/templates/{template_id}", response_model=TemplateResponse)
def update_template(template_id: str, request: TemplateCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = ProductService(db)
    return service.update_template(template_id, request.model_dump(exclude_unset=True), admin_id=str(admin.id))


@router.delete("/templates/{template_id}")
def delete_template(template_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = ProductService(db)
    service.delete_template(template_id, admin_id=str(admin.id))
    return {"message": "Template deleted successfully"}
