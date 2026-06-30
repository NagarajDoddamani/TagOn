from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List
from core.database import get_db
from core.security import require_admin
from core.cloudinary import upload_image
from schemas.template_group import TemplateGroupCreate, TemplateGroupResponse
from schemas.product import TemplateResponse
from services.template_group_service import TemplateGroupService
from models.user import User
from utils.pagination import build_paginated_response

router = APIRouter(prefix="/api/template-groups", tags=["Template Groups"])


class BatchUploadResult(BaseModel):
    templates: List[TemplateResponse]
    failed: List[dict]
    total_created: int
    total_failed: int


@router.get("", response_model=list[TemplateGroupResponse])
def get_groups(
    page: Optional[int] = Query(None, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = TemplateGroupService(db)
    result = service.get_groups(page=page, per_page=per_page)
    if page is not None:
        items, total = result
        return build_paginated_response(
            [TemplateGroupResponse.model_validate(g) for g in items],
            total, page, per_page,
        )
    return [TemplateGroupResponse.model_validate(g) for g in result]


@router.get("/{group_id}", response_model=TemplateGroupResponse)
def get_group(group_id: str, db: Session = Depends(get_db)):
    service = TemplateGroupService(db)
    return service.get_group(group_id)


@router.post("", response_model=TemplateGroupResponse)
def create_group(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    preview_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    image_url = None
    if preview_image:
        result = upload_image(preview_image, folder="tagon/template_groups")
        image_url = result["url"]
    service = TemplateGroupService(db)
    return service.create_group(
        {"name": name, "description": description, "preview_image": image_url},
        admin_id=str(admin.id),
    )


@router.put("/{group_id}", response_model=TemplateGroupResponse)
def update_group(
    group_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    preview_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    data = {}
    if name is not None:
        data["name"] = name
    if description is not None:
        data["description"] = description
    if preview_image:
        result = upload_image(preview_image, folder="tagon/template_groups")
        data["preview_image"] = result["url"]
    service = TemplateGroupService(db)
    return service.update_group(group_id, data, admin_id=str(admin.id))


@router.delete("/{group_id}")
def delete_group(group_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = TemplateGroupService(db)
    service.delete_group(group_id, admin_id=str(admin.id))
    return {"message": "Template group deleted successfully"}


@router.get("/{group_id}/templates", response_model=list[TemplateResponse])
def get_group_templates(group_id: str, db: Session = Depends(get_db)):
    service = TemplateGroupService(db)
    return service.get_templates(group_id)


@router.post("/{group_id}/templates/batch", response_model=BatchUploadResult)
async def create_templates_batch(
    group_id: str,
    files: List[UploadFile] = File(...),
    max_upload_count: int = Form(1),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
    MAX_SIZE = 5 * 1024 * 1024

    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    service = TemplateGroupService(db)
    created_templates = []
    failed_files = []

    for f in files:
        content_type = f.content_type or ""
        if content_type not in ALLOWED_TYPES:
            failed_files.append({"filename": f.filename, "reason": f"Invalid file type: {content_type}. Allowed: JPEG, PNG, WEBP"})
            continue
        file_bytes = await f.read()
        if len(file_bytes) > MAX_SIZE:
            failed_files.append({"filename": f.filename, "reason": f"File too large ({len(file_bytes) / (1024*1024):.1f}MB). Max: 5MB"})
            continue
        name = f.filename.rsplit(".", 1)[0] if f.filename else "Untitled"
        template = service.create_template_from_image(
            group_id=group_id,
            name=name,
            image_file=f,
            file_bytes=file_bytes,
            max_upload_count=max_upload_count,
            admin_id=str(admin.id),
        )
        created_templates.append(template)

    return {"templates": created_templates, "failed": failed_files, "total_created": len(created_templates), "total_failed": len(failed_files)}
