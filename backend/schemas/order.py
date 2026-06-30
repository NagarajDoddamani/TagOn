from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class DeliveryAddress(BaseModel):
    recipient_name: str
    mobile: str
    address_line: str
    city: str
    state: str
    postal_code: str
    landmark: Optional[str] = None


class OrderCreate(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    template_id: Optional[str] = None
    quantity: int = Field(1, ge=1)
    delivery_address: DeliveryAddress
    customization_notes: Optional[str] = None
    uploaded_images: Optional[List[str]] = None


class OrderResponse(BaseModel):
    id: str
    customer_id: str
    product_id: str
    variant_id: Optional[str]
    template_id: Optional[str]
    quantity: int
    total_amount: float
    payment_status: str
    order_status: str
    delivery_address: dict
    customization_notes: Optional[str]
    is_customized: bool
    uploaded_images: Optional[list]
    created_at: datetime

    @field_validator("id", "customer_id", "product_id", "variant_id", "template_id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    id: str
    product_name: Optional[str]
    customer_name: Optional[str] = None
    total_amount: float
    order_status: str
    payment_status: str
    is_customized: bool
    created_at: datetime

    @field_validator("id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None
