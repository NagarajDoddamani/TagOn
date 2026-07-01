from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class AddressCreate(BaseModel):
    recipient_name: str = Field(..., min_length=1, max_length=100)
    mobile: str = Field(..., min_length=10, max_length=20)
    address_line: str = Field(..., min_length=1, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    landmark: Optional[str] = Field(None, max_length=255)
    is_default: bool = False


class AddressUpdate(BaseModel):
    recipient_name: Optional[str] = Field(None, min_length=1, max_length=100)
    mobile: Optional[str] = Field(None, min_length=10, max_length=20)
    address_line: Optional[str] = Field(None, min_length=1, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, min_length=1, max_length=20)
    landmark: Optional[str] = Field(None, max_length=255)
    is_default: Optional[bool] = None


class AddressResponse(BaseModel):
    id: str
    recipient_name: str
    mobile: str
    address_line: str
    city: str
    state: str
    postal_code: str
    landmark: Optional[str]
    is_default: bool
    created_at: Optional[datetime]

    @field_validator("id", mode="before")
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if isinstance(v, UUID) else v

    class Config:
        from_attributes = True
