from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class PaymentUpload(BaseModel):
    transaction_id: Optional[str] = None


class PaymentResponse(BaseModel):
    id: str
    order_id: str
    screenshot_url: Optional[str]
    transaction_id: Optional[str]
    verification_status: str
    verified_by: Optional[str]
    verified_at: Optional[datetime]
    created_at: datetime

    @field_validator("id", "order_id", "verified_by", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True


class PaymentVerify(BaseModel):
    status: str
    remarks: Optional[str] = None
