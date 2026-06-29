from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str

    class Config:
        from_attributes = True


class VariantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0)
    stock: int = Field(0, ge=0)
    image_url: Optional[str] = None


class VariantResponse(BaseModel):
    id: str
    name: str
    price: float
    stock: int
    image_url: Optional[str]

    class Config:
        from_attributes = True


class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    max_upload_count: int = Field(1, ge=1, le=20)
    orientation: Optional[str] = None
    preview_image: Optional[str] = None


class TemplateResponse(BaseModel):
    id: str
    name: str
    preview_image: Optional[str]
    max_upload_count: int
    orientation: Optional[str]
    status: str

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    category_id: str
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    base_price: float = Field(..., ge=0)
    product_type: str = Field(..., pattern="^(customized|ready_made)$")
    customizable: bool = False
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    base_price: Optional[float] = Field(None, ge=0)
    product_type: Optional[str] = Field(None, pattern="^(customized|ready_made)$")
    customizable: Optional[bool] = None
    image_url: Optional[str] = None
    status: Optional[str] = None


class ProductResponse(BaseModel):
    id: str
    category_id: str
    name: str
    description: Optional[str]
    base_price: float
    product_type: str
    customizable: bool
    status: str
    image_url: Optional[str]
    category: Optional[CategoryResponse]
    variants: List[VariantResponse] = []
    templates: List[TemplateResponse] = []

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    id: str
    category_id: str
    name: str
    description: Optional[str]
    base_price: float
    product_type: str
    customizable: bool
    status: str
    image_url: Optional[str]
    category: Optional[CategoryResponse]

    class Config:
        from_attributes = True
