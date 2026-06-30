from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime, timezone
from core.cache import cache
from repositories.order_repository import OrderRepository
from repositories.user_repository import UserRepository
from repositories.product_repository import ProductRepository
from repositories.activity_log_repository import ActivityLogRepository
from models.order import Order
from models.user import User


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.user_repo = UserRepository(db)
        self.product_repo = ProductRepository(db)
        self.log_repo = ActivityLogRepository(db)

    def get_dashboard(self):
        cached = cache.get("dashboard:metrics")
        if cached:
            return cached

        orders = self.order_repo.get_all()
        customers = self.user_repo.get_all_customers()
        products = self.product_repo.get_all()

        now = datetime.now(timezone.utc)

        # Status breakdown
        status_counts = {}
        for o in orders:
            status_counts[o.order_status] = status_counts.get(o.order_status, 0) + 1

        # Revenue calculations
        revenue_daily = 0
        revenue_monthly = 0
        revenue_yearly = 0
        for o in orders:
            if o.order_status in ("cancelled", "archived"):
                continue
            if o.created_at.year == now.year:
                revenue_yearly += o.total_amount
                if o.created_at.month == now.month:
                    revenue_monthly += o.total_amount
                    if o.created_at.day == now.day:
                        revenue_daily += o.total_amount

        # Top selling products
        product_sales = {}
        for o in orders:
            if o.product:
                pid = str(o.product.id)
                if pid not in product_sales:
                    product_sales[pid] = {
                        "product_id": pid,
                        "product_name": o.product.name,
                        "total_sold": 0,
                        "total_revenue": 0,
                    }
                product_sales[pid]["total_sold"] += o.quantity
                product_sales[pid]["total_revenue"] += o.total_amount

        top_products = sorted(product_sales.values(), key=lambda x: x["total_sold"], reverse=True)[:10]

        # Recent orders
        recent_orders_raw = self.db.query(Order).order_by(Order.created_at.desc()).limit(10).all()
        recent_orders = []
        for o in recent_orders_raw:
            customer_name = "N/A"
            if o.customer_id:
                cust = self.db.query(User).filter(User.id == o.customer_id).first()
                if cust:
                    customer_name = cust.name
            recent_orders.append({
                "id": str(o.id),
                "order_id_short": str(o.id)[:8],
                "customer_name": customer_name,
                "total_amount": o.total_amount,
                "order_status": o.order_status,
                "payment_status": o.payment_status,
                "created_at": o.created_at,
            })

        # Recent activity
        logs_raw = self.log_repo.get_all(limit=20)
        recent_activity = []
        for l in logs_raw:
            user = None
            if l.user_id:
                user = self.db.query(User).filter(User.id == l.user_id).first()
            recent_activity.append({
                "id": str(l.id),
                "user_name": user.name if user else "System",
                "action": l.action,
                "entity_type": l.entity_type,
                "details": l.details,
                "timestamp": l.timestamp,
            })

        # Customer stats
        active_customers = len([c for c in customers if c.status == "active"])
        new_customers_this_month = len([
            c for c in customers
            if c.created_at and c.created_at.month == now.month and c.created_at.year == now.year
        ])

        result = {
            "total_orders": len(orders),
            "pending_payments": status_counts.get("payment_pending_verification", 0),
            "payment_verified": status_counts.get("payment_verified", 0),
            "designing": status_counts.get("designing", 0),
            "approval_pending": status_counts.get("approval_pending", 0),
            "approved": status_counts.get("approved", 0),
            "printing": status_counts.get("printing", 0),
            "packing": status_counts.get("packing", 0),
            "shipped": status_counts.get("shipped", 0),
            "delivered": status_counts.get("delivered", 0),
            "cancelled": status_counts.get("cancelled", 0),
            "archived": status_counts.get("archived", 0),
            "active_orders": len([o for o in orders if o.order_status not in ("delivered", "cancelled", "archived")]),
            "completed_orders": status_counts.get("delivered", 0),
            "total_products": len(products),
            "customer_count": len(customers),
            "active_customers": active_customers,
            "new_customers_this_month": new_customers_this_month,
            "revenue_daily": revenue_daily,
            "revenue_monthly": revenue_monthly,
            "revenue_yearly": revenue_yearly,
            "top_products": top_products,
            "recent_orders": recent_orders,
            "recent_activity": recent_activity,
        }
        cache.set("dashboard:metrics", result, ttl_seconds=30)
        return result
