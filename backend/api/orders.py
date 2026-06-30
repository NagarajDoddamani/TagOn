from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from core.security import get_current_user, require_admin
from schemas.order import OrderCreate, OrderResponse, OrderListResponse, OrderStatusUpdate
from schemas.payment import PaymentResponse
from services.order_service import OrderService
from services.payment_service import PaymentService
from models.user import User
from datetime import datetime
from utils.pagination import build_paginated_response

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse)
def create_order(request: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can create orders")
    service = OrderService(db)
    return service.create_order(customer_id=str(current_user.id), data=request.model_dump())


@router.get("")
def get_orders(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    page: Optional[int] = Query(None, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = OrderService(db)
    if current_user.role == "customer":
        orders = service.get_customer_orders(str(current_user.id), status=status)
        result = []
        for order in orders:
            result.append(OrderListResponse(
                id=str(order.id),
                product_name=order.product.name if order.product else None,
                customer_name=None,
                total_amount=order.total_amount,
                order_status=order.order_status,
                payment_status=order.payment_status,
                is_customized=order.is_customized,
                created_at=order.created_at,
            ))
        return result
    else:
        from repositories.order_repository import OrderRepository
        repo = OrderRepository(db)
        result = repo.search_orders(
            search=search, status=status, payment_status=payment_status,
            start_date=start_date, end_date=end_date,
            min_amount=min_amount, max_amount=max_amount,
            page=page, per_page=per_page,
        )
        if page is not None:
            items, total = result
            serialized = []
            for order in items:
                cust = order.customer
                serialized.append(OrderListResponse(
                    id=str(order.id),
                    product_name=order.product.name if order.product else None,
                    customer_name=cust.name if cust else None,
                    total_amount=order.total_amount,
                    order_status=order.order_status,
                    payment_status=order.payment_status,
                    is_customized=order.is_customized,
                    created_at=order.created_at,
                ))
            return build_paginated_response(serialized, total, page, per_page)
        serialized = []
        for order in result:
            cust = order.customer
            serialized.append(OrderListResponse(
                id=str(order.id),
                product_name=order.product.name if order.product else None,
                customer_name=cust.name if cust else None,
                total_amount=order.total_amount,
                order_status=order.order_status,
                payment_status=order.payment_status,
                is_customized=order.is_customized,
                created_at=order.created_at,
            ))
        return serialized


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = OrderService(db)
    order = service.get_order(order_id)
    if current_user.role == "customer" and str(order.customer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    return order


@router.put("/{order_id}/status")
def update_order_status(
    order_id: str,
    request: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    service = OrderService(db)
    service.update_order_status(
        order_id=order_id,
        new_status=request.status,
        updated_by=str(admin.id),
        remarks=request.remarks,
    )
    return {"message": "Order status updated"}


@router.get("/{order_id}/payment", response_model=PaymentResponse)
def get_order_payment(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = PaymentService(db)
    return service.get_payment(order_id)


@router.get("/{order_id}/status-history")
def get_order_status_history(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from repositories.order_repository import OrderStatusHistoryRepository
    repo = OrderStatusHistoryRepository(db)
    history = repo.get_by_order(order_id)
    return [
        {
            "id": str(h.id),
            "previous_status": h.previous_status,
            "new_status": h.new_status,
            "remarks": h.remarks,
            "timestamp": h.timestamp,
        }
        for h in history
    ]


@router.get("/{order_id}/timeline")
def get_order_timeline(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = OrderService(db)
    order = service.get_order(order_id)
    if current_user.role == "customer" and str(order.customer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    timeline = service.get_timeline(order_id)
    def serialize_dt(val):
        if isinstance(val, datetime):
            return val.isoformat()
        if val is None:
            return None
        return str(val)
    result = []
    for entry in timeline:
        entry["timestamp"] = serialize_dt(entry["timestamp"])
        result.append(entry)
    return result
