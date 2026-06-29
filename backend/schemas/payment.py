from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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

    class Config:
        from_attributes = True


class PaymentVerify(BaseModel):
    status: str
    remarks: Optional[str] = None
