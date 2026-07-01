from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from core.security import get_current_user, require_admin
from core.cloudinary import upload_image
from core.config import settings
from schemas.payment import PaymentResponse, PaymentVerify
from services.payment_service import PaymentService
from models.user import User

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.get("/qr")
def get_qr_code(db: Session = Depends(get_db)):
    from services.settings_service import SettingsService
    service = SettingsService(db)
    qr_config = service.get_group("qr_config")
    qr_url = qr_config.get("qr_image_url") or settings.QR_IMAGE_URL
    return {"qr_image_url": qr_url}


@router.get("/business-info")
def get_business_info(db: Session = Depends(get_db)):
    from services.settings_service import SettingsService
    service = SettingsService(db)
    biz = service.get_group("business_info")
    contact = service.get_group("contact")
    return {
        "business_name": biz.get("business_name", "TagOn"),
        "tagline": biz.get("tagline", ""),
        "logo_url": biz.get("logo_url", ""),
        "phone": contact.get("phone", ""),
        "email": contact.get("email", ""),
    }


@router.post("/upload/{order_id}", response_model=PaymentResponse)
def upload_payment_screenshot(
    order_id: str,
    transaction_id: Optional[str] = Form(None),
    screenshot: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = upload_image(screenshot, folder="tagon/payments")
    service = PaymentService(db)
    return service.upload_payment(
        order_id=order_id,
        screenshot_url=result["url"],
        transaction_id=transaction_id,
    )


@router.post("/verify/{order_id}")
def verify_payment(
    order_id: str,
    request: PaymentVerify,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = PaymentService(db)
    service.verify_payment(
        order_id=order_id,
        status=request.status,
        verified_by=str(admin.id),
        remarks=request.remarks,
    )
    return {"message": f"Payment {request.status} successfully"}
