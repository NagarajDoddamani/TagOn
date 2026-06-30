from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from core.security import get_current_user, require_admin
from core.cloudinary import upload_image
from schemas.workspace import ChatMessageSend, ChatMessageResponse
from services.chat_service import ChatService
from models.user import User

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.get("/{order_id}/messages", response_model=list[ChatMessageResponse])
def get_messages(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = ChatService(db)
    from services.order_service import OrderService
    order = OrderService(db).get_order(order_id)
    if current_user.role == "customer" and str(order.customer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    return service.get_messages(order_id, str(current_user.id))


@router.post("/{order_id}/messages", response_model=ChatMessageResponse)
def send_message(
    order_id: str,
    request: ChatMessageSend,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ChatService(db)
    from services.order_service import OrderService
    order = OrderService(db).get_order(order_id)
    if current_user.role == "customer" and str(order.customer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    msg = service.send_message(
        order_id=order_id,
        sender_id=str(current_user.id),
        message=request.message,
        attachment_url=request.attachment_url,
        attachment_type=request.attachment_type,
    )
    from schemas.workspace import ChatMessageResponse
    return msg


@router.post("/{order_id}/attachments")
def upload_attachment(
    order_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from services.order_service import OrderService
    order = OrderService(db).get_order(order_id)
    if current_user.role == "customer" and str(order.customer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")

    result = upload_image(file, folder=f"tagon/chat/{order_id}")
    service = ChatService(db)
    msg = service.send_message(
        order_id=order_id,
        sender_id=str(current_user.id),
        message=None,
        attachment_url=result["url"],
        attachment_type=file.content_type,
    )
    return {
        "id": str(msg.id),
        "order_id": str(msg.order_id),
        "sender_id": str(msg.sender_id),
        "attachment_url": msg.attachment_url,
        "attachment_type": msg.attachment_type,
        "created_at": msg.created_at,
    }


@router.get("/{order_id}/unread")
def get_unread_count(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = ChatService(db)
    count = service.get_unread_count(order_id, str(current_user.id))
    return {"unread_count": count}


@router.put("/messages/{message_id}/read")
def mark_read(message_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = ChatService(db)
    service.mark_read(message_id)
    return {"message": "Message marked as read"}
