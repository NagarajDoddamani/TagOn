from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from core.database import get_db
from core.security import get_current_user, require_admin
from core.cloudinary import upload_image
from schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    CategoryCreate, CategoryResponse, VariantCreate, VariantUpdate, VariantResponse,
    TemplateCreate, TemplateResponse, TemplateImageResponse,
)
from services.product_service import ProductService
from models.user import User
from utils.pagination import build_paginated_response

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
    template_group_id: Optional[str] = Form(None),
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
        "template_group_id": template_group_id or None,
        "image_url": image_url,
    }
    service = ProductService(db)
    return service.create_product(data, admin_id=str(admin.id))


@router.get("")
def get_products(
    category_id: Optional[str] = Query(None),
    product_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    is_visible: Optional[bool] = Query(None),
    tags: Optional[str] = Query(None),
    page: Optional[int] = Query(None, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    tag_list = tags.split(",") if tags else None
    result = service.get_products(
        category_id=category_id, product_type=product_type, search=search,
        featured=featured, is_visible=is_visible, tags=tag_list,
        page=page, per_page=per_page,
    )
    if page is not None:
        items, total = result
        return build_paginated_response(
            [ProductListResponse.model_validate(p) for p in items],
            total, page, per_page,
        )
    return [ProductListResponse.model_validate(p) for p in result]


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
    template_group_id: Optional[str] = Form(None),
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
    if template_group_id is not None:
        data["template_group_id"] = template_group_id if template_group_id else None
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


@router.put("/{product_id}/featured", response_model=ProductResponse)
def toggle_featured(
    product_id: str,
    featured: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ProductService(db)
    return service.toggle_featured(product_id, featured, admin_id=str(admin.id))


@router.put("/{product_id}/visibility", response_model=ProductResponse)
def toggle_visibility(
    product_id: str,
    visible: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ProductService(db)
    return service.toggle_visibility(product_id, visible, admin_id=str(admin.id))


@router.put("/{product_id}/tags", response_model=ProductResponse)
def update_tags(
    product_id: str,
    tags: list[str],
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ProductService(db)
    return service.update_tags(product_id, tags, admin_id=str(admin.id))


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


@router.put("/variants/{variant_id}", response_model=VariantResponse)
def update_variant(variant_id: str, request: VariantUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = ProductService(db)
    return service.update_variant(variant_id, request.model_dump(exclude_unset=True), admin_id=str(admin.id))


@router.delete("/variants/{variant_id}")
def delete_variant(variant_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = ProductService(db)
    service.delete_variant(variant_id, admin_id=str(admin.id))
    return {"message": "Variant deleted successfully"}


@router.get("/{product_id}/variants", response_model=list[VariantResponse])
def get_variants(product_id: str, db: Session = Depends(get_db)):
    from repositories.product_repository import VariantRepository
    return VariantRepository(db).get_by_product(product_id)


@router.post("/{product_id}/templates", response_model=TemplateResponse)
def create_template(
    product_id: str,
    name: str = Form(...),
    max_upload_count: int = Form(1),
    orientation: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ProductService(db)
    template = service.create_template(
        product_id=product_id, name=name,
        max_upload_count=max_upload_count,
        orientation=orientation,
        admin_id=str(admin.id),
    )
    if images:
        image_urls = []
        for img in images:
            result = upload_image(img, folder="tagon/templates")
            image_urls.append(result["url"])
        service.add_template_images(str(template.id), image_urls, admin_id=str(admin.id))
    from repositories.product_repository import TemplateRepository, TemplateImageRepository
    template = TemplateRepository(db).get_by_id(str(template.id))
    return template


@router.get("/{product_id}/templates", response_model=list[TemplateResponse])
def get_templates(product_id: str, db: Session = Depends(get_db)):
    from repositories.product_repository import TemplateRepository
    return TemplateRepository(db).get_by_product(product_id)


@router.put("/templates/{template_id}", response_model=TemplateResponse)
def update_template(template_id: str, request: TemplateCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = ProductService(db)
    return service.update_template(template_id, request.model_dump(exclude_unset=True), admin_id=str(admin.id))


@router.post("/templates/{template_id}/images", response_model=list[TemplateImageResponse])
def add_template_images(
    template_id: str,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ProductService(db)
    image_urls = []
    for img in images:
        result = upload_image(img, folder="tagon/templates")
        image_urls.append(result["url"])
    return service.add_template_images(template_id, image_urls, admin_id=str(admin.id))


@router.delete("/templates/images/{image_id}")
def delete_template_image(
    image_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ProductService(db)
    service.delete_template_image(image_id, admin_id=str(admin.id))
    return {"message": "Template image deleted"}


@router.put("/templates/{template_id}/images/reorder")
def reorder_template_images(
    template_id: str,
    image_ids: list[str],
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = ProductService(db)
    service.reorder_template_images(template_id, image_ids, admin_id=str(admin.id))
    return {"message": "Images reordered"}


@router.delete("/templates/{template_id}")
def delete_template(template_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = ProductService(db)
    service.delete_template(template_id, admin_id=str(admin.id))
    return {"message": "Template deleted successfully"}
