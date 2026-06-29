from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import require_admin
from repositories.user_repository import UserRepository
from repositories.order_repository import OrderRepository
from repositories.product_repository import ProductRepository
from repositories.activity_log_repository import ActivityLogRepository
from models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    order_repo = OrderRepository(db)
    user_repo = UserRepository(db)
    product_repo = ProductRepository(db)

    orders = order_repo.get_all()
    customers = user_repo.get_all_customers()
    products = product_repo.get_all()

    total_orders = len(orders)
    pending_payments = len([o for o in orders if o.payment_status == "pending"])
    active_orders = len([o for o in orders if o.order_status not in ("delivered", "cancelled", "archived")])
    completed_orders = len([o for o in orders if o.order_status == "delivered"])
    total_products = len(products)
    customer_count = len(customers)

    return {
        "total_orders": total_orders,
        "pending_payments": pending_payments,
        "active_orders": active_orders,
        "completed_orders": completed_orders,
        "total_products": total_products,
        "customer_count": customer_count,
    }


@router.get("/customers")
def get_customers(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user_repo = UserRepository(db)
    customers = user_repo.get_all_customers()
    return [
        {"id": str(c.id), "name": c.name, "email": c.email, "phone": c.phone, "status": c.status, "created_at": c.created_at}
        for c in customers
    ]


@router.get("/activity-logs")
def get_activity_logs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    log_repo = ActivityLogRepository(db)
    logs = log_repo.get_all()
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
