from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ReviewCreate(BaseModel):
    order_id: str
    rating: int = Field(..., ge=1, le=5)
    title: str = Field(..., min_length=1, max_length=200)
    review: str = Field(..., min_length=1, max_length=2000)


class ReviewResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    customer_id: str
    rating: int
    title: str
    review: str
    status: str
    verified_purchase: bool
    created_at: datetime
    customer_name: Optional[str] = None
    product_name: Optional[str] = None

    @field_validator("id", "order_id", "product_id", "customer_id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    id: str
    rating: int
    title: str
    review: str
    status: str
    verified_purchase: bool
    created_at: datetime
    customer_name: Optional[str] = None
    product_name: Optional[str] = None

    @field_validator("id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True


class AdminReviewResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    customer_id: str
    rating: int
    title: str
    review: str
    status: str
    verified_purchase: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    product_name: Optional[str] = None

    @field_validator("id", "order_id", "product_id", "customer_id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True
