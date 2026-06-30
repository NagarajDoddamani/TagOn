from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TemplateGroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    preview_image: Optional[str] = None


class TemplateGroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    preview_image: Optional[str] = None
    status: Optional[str] = None


class TemplateGroupResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    preview_image: Optional[str]
    status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
