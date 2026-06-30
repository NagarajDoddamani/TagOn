from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from core.security import get_current_user, require_admin
from core.cloudinary import upload_image
from schemas.workspace import DesignPreviewResponse, DesignRevisionCreate, DesignRevisionResponse
from services.design_service import DesignService
from models.user import User

router = APIRouter(prefix="/api/designs", tags=["Designs"])


@router.post("/{order_id}/previews", response_model=DesignPreviewResponse)
def upload_preview(
    order_id: str,
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    from services.order_service import OrderService
    order = OrderService(db).get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    result = upload_image(file, folder=f"tagon/designs/{order_id}")
    service = DesignService(db)
    preview = service.upload_preview(
        order_id=order_id,
        image_url=result["url"],
        public_id=result["public_id"],
        uploaded_by=str(admin.id),
        notes=notes,
    )
    return preview


@router.get("/{order_id}/previews", response_model=list[DesignPreviewResponse])
def get_previews(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from services.order_service import OrderService
    order = OrderService(db).get_order(order_id)
    if current_user.role == "customer" and str(order.customer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    service = DesignService(db)
    return service.get_previews(order_id)


@router.get("/{order_id}/previews/latest", response_model=DesignPreviewResponse)
def get_latest_preview(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from services.order_service import OrderService
    order = OrderService(db).get_order(order_id)
    if current_user.role == "customer" and str(order.customer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    service = DesignService(db)
    preview = service.get_latest_preview(order_id)
    if not preview:
        raise HTTPException(status_code=404, detail="No design preview found")
    return preview


@router.post("/{order_id}/revisions", response_model=DesignRevisionResponse)
def submit_revision(
    order_id: str,
    request: DesignRevisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from services.order_service import OrderService
    order = OrderService(db).get_order(order_id)
    if current_user.role == "customer" and str(order.customer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role == "customer" and request.action not in ("approved", "changes_requested"):
        raise HTTPException(status_code=400, detail="Customer can only approve or request changes")

    service = DesignService(db)
    revision = service.submit_revision(
        order_id=order_id,
        customer_id=str(current_user.id),
        action=request.action,
        comments=request.comments,
        design_id=request.design_id,
    )
    return revision


@router.get("/{order_id}/revisions", response_model=list[DesignRevisionResponse])
def get_revisions(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from services.order_service import OrderService
    order = OrderService(db).get_order(order_id)
    if current_user.role == "customer" and str(order.customer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    service = DesignService(db)
    return service.get_revisions(order_id)


@router.get("/{order_id}/is-approved")
def is_design_approved(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from services.order_service import OrderService
    order = OrderService(db).get_order(order_id)
    if current_user.role == "customer" and str(order.customer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    service = DesignService(db)
    return {"is_approved": service.is_approved(order_id)}
