from fastapi import APIRouter, Depends, Query, UploadFile, File, Form
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from core.database import get_db
from core.security import require_admin
from core.cloudinary import upload_image
from repositories.user_repository import UserRepository
from repositories.order_repository import OrderRepository
from repositories.activity_log_repository import ActivityLogRepository
from services.dashboard_service import DashboardService
from services.settings_service import SettingsService
from models.user import User
from utils.pagination import build_paginated_response

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    service = DashboardService(db)
    return service.get_dashboard()


@router.get("/customers")
def get_customers(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    page: Optional[int] = Query(None, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user_repo = UserRepository(db)
    filters = {}
    if search:
        filters["search"] = search
    if status:
        filters["status"] = status
    if start_date:
        filters["start_date"] = datetime.fromisoformat(start_date)
    if end_date:
        filters["end_date"] = datetime.fromisoformat(end_date)
    filters["page"] = page
    filters["per_page"] = per_page
    customers = user_repo.search_customers(**filters)
    if page is not None:
        items, total = customers
        return build_paginated_response(
            [{"id": str(c.id), "name": c.name, "email": c.email, "phone": c.phone,
              "status": c.status, "created_at": c.created_at} for c in items],
            total, page, per_page,
        )
    return [
        {
            "id": str(c.id), "name": c.name, "email": c.email, "phone": c.phone,
            "status": c.status, "created_at": c.created_at,
        }
        for c in customers
    ]


@router.get("/customers/{customer_id}")
def get_customer_detail(customer_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user_repo = UserRepository(db)
    customer = user_repo.get_by_id(customer_id)
    if not customer or customer.role != "customer":
        raise HTTPException(status_code=404, detail="Customer not found")
    return {
        "id": str(customer.id),
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "status": customer.status,
        "created_at": customer.created_at,
    }


@router.get("/customers/{customer_id}/orders")
def get_customer_orders(customer_id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user_repo = UserRepository(db)
    customer = user_repo.get_by_id(customer_id)
    if not customer or customer.role != "customer":
        raise HTTPException(status_code=404, detail="Customer not found")
    order_repo = OrderRepository(db)
    orders = order_repo.get_by_customer(customer_id)
    return [
        {
            "id": str(o.id),
            "product_name": o.product.name if o.product else "N/A",
            "quantity": o.quantity,
            "total_amount": o.total_amount,
            "order_status": o.order_status,
            "payment_status": o.payment_status,
            "created_at": o.created_at,
        }
        for o in orders
    ]


@router.put("/customers/{customer_id}/status")
def update_customer_status(
    customer_id: str,
    status: str = Query(..., description="New status: active or suspended"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if status not in ("active", "suspended"):
        raise HTTPException(status_code=400, detail="Status must be 'active' or 'suspended'")
    user_repo = UserRepository(db)
    customer = user_repo.get_by_id(customer_id)
    if not customer or customer.role != "customer":
        raise HTTPException(status_code=404, detail="Customer not found")
    customer = user_repo.update_status(customer, status)
    return {
        "id": str(customer.id),
        "name": customer.name,
        "status": customer.status,
        "message": f"Customer status updated to '{status}'",
    }


@router.get("/activity-logs")
def get_activity_logs(
    page: Optional[int] = Query(None, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    log_repo = ActivityLogRepository(db)
    logs = log_repo.get_all(page=page, per_page=per_page)
    if page is not None:
        items, total = logs
        return build_paginated_response(
            [{"id": str(l.id), "user_id": str(l.user_id) if l.user_id else None,
              "action": l.action, "entity_type": l.entity_type,
              "entity_id": l.entity_id, "details": l.details,
              "timestamp": l.timestamp} for l in items],
            total, page, per_page,
        )
    return [
        {
            "id": str(l.id),
            "user_id": str(l.user_id) if l.user_id else None,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "timestamp": l.timestamp,
        }
        for l in logs
    ]


SETTINGS_GROUPS = {"business_info", "qr_config", "contact", "retention", "preferences"}


@router.get("/settings/{group}")
def get_settings_group(group: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if group not in SETTINGS_GROUPS:
        raise HTTPException(status_code=400, detail=f"Invalid group. Valid: {', '.join(sorted(SETTINGS_GROUPS))}")
    service = SettingsService(db)
    return service.get_group(group)


@router.put("/settings/{group}")
def update_settings_group(group: str, data: dict, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if group not in SETTINGS_GROUPS:
        raise HTTPException(status_code=400, detail=f"Invalid group. Valid: {', '.join(sorted(SETTINGS_GROUPS))}")
    service = SettingsService(db)
    return service.update_group(group, data)


@router.post("/settings/upload-image")
async def upload_settings_image(
    group: str = Form(...),
    key: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if group not in SETTINGS_GROUPS:
        raise HTTPException(status_code=400, detail=f"Invalid group. Valid: {', '.join(sorted(SETTINGS_GROUPS))}")
    ALLOWED = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WEBP images allowed")
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be less than 5MB")
    file.file.seek(0)
    result = upload_image(file, folder="tagon/settings")
    service = SettingsService(db)
    current = service.get_group(group)
    current[key] = result["url"]
    updated = service.update_group(group, current)
    return updated
