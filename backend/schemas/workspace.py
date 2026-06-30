from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ChatMessageSend(BaseModel):
    message: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: str
    order_id: str
    sender_id: str
    sender_name: Optional[str] = None
    message: Optional[str]
    attachment_url: Optional[str]
    attachment_type: Optional[str]
    read_at: Optional[datetime]
    created_at: datetime

    @field_validator("id", "order_id", "sender_id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True


class DesignPreviewUpload(BaseModel):
    notes: Optional[str] = None


class DesignPreviewResponse(BaseModel):
    id: str
    order_id: str
    image_url: str
    notes: Optional[str]
    uploaded_by: str
    version: int
    created_at: datetime

    @field_validator("id", "order_id", "uploaded_by", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True


class DesignRevisionCreate(BaseModel):
    action: str
    comments: Optional[str] = None
    design_id: Optional[str] = None


class DesignRevisionResponse(BaseModel):
    id: str
    order_id: str
    design_id: Optional[str]
    customer_id: str
    action: str
    comments: Optional[str]
    created_at: datetime

    @field_validator("id", "order_id", "design_id", "customer_id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True
