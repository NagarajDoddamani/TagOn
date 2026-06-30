from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str

    @field_validator("id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True


class VariantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0)
    stock: int = Field(0, ge=0)
    image_url: Optional[str] = None


class VariantUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None


class VariantResponse(BaseModel):
    id: str
    name: str
    price: float
    stock: int
    image_url: Optional[str]

    @field_validator("id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True


class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    max_upload_count: int = Field(1, ge=1, le=100)
    orientation: Optional[str] = None


class TemplateImageResponse(BaseModel):
    id: str
    image_url: str
    sort_order: int

    @field_validator("id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True


class TemplateResponse(BaseModel):
    id: str
    name: str
    max_upload_count: int
    orientation: Optional[str]
    status: str
    images: List[TemplateImageResponse] = []

    @field_validator("id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

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
    is_featured: Optional[bool] = None
    is_visible: Optional[bool] = None
    tags: Optional[list[str]] = None
    low_stock_threshold: Optional[int] = Field(None, ge=0)


class ProductResponse(BaseModel):
    id: str
    category_id: str
    template_group_id: Optional[str] = None
    name: str
    description: Optional[str]
    base_price: float
    product_type: str
    customizable: bool
    status: str
    image_url: Optional[str]
    is_featured: bool = False
    is_visible: bool = True
    tags: list = []
    low_stock_threshold: int = 5
    category: Optional[CategoryResponse]
    variants: List[VariantResponse] = []
    templates: List[TemplateResponse] = []

    @field_validator("id", "category_id", "template_group_id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    @field_validator("is_featured", "is_visible", mode="before")
    @classmethod
    def coerce_bool(cls, v):
        return False if v is None else v

    @field_validator("tags", mode="before")
    @classmethod
    def coerce_tags(cls, v):
        return [] if v is None else v

    @field_validator("low_stock_threshold", mode="before")
    @classmethod
    def coerce_stock_threshold(cls, v):
        return 5 if v is None else v

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    id: str
    category_id: str
    template_group_id: Optional[str] = None
    name: str
    description: Optional[str]
    base_price: float
    product_type: str
    customizable: bool
    status: str
    image_url: Optional[str]
    is_featured: bool = False
    is_visible: bool = True
    tags: list = []
    low_stock_threshold: int = 5
    category: Optional[CategoryResponse]

    @field_validator("id", "category_id", "template_group_id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    @field_validator("is_featured", "is_visible", mode="before")
    @classmethod
    def coerce_bool(cls, v):
        return False if v is None else v

    @field_validator("tags", mode="before")
    @classmethod
    def coerce_tags(cls, v):
        return [] if v is None else v

    @field_validator("low_stock_threshold", mode="before")
    @classmethod
    def coerce_stock_threshold(cls, v):
        return 5 if v is None else v

    class Config:
        from_attributes = True
