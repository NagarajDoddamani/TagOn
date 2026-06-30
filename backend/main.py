import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from core.database import engine, Base, SessionLocal
from core.config import settings
from core.middleware import SecurityHeadersMiddleware
from core.logging_config import RequestLoggingMiddleware
from api import auth, products, orders, payments, notifications, admin, uploads, chat, designs, reports, reviews, addresses, template_groups

app = FastAPI(
    title="TagOn API",
    description="TagOn - Customized Gift Ordering & Business Management System API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if settings.DEBUG:
        import traceback
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "traceback": traceback.format_exc()},
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred"},
    )


app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(uploads.router)
app.include_router(chat.router)
app.include_router(designs.router)
app.include_router(reports.router)
app.include_router(reviews.router)
app.include_router(addresses.router)
app.include_router(template_groups.router)


@app.get(f"{settings.API_PREFIX}/health")
def health_check():
    db_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        pass
    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "TagOn API",
        "environment": settings.ENVIRONMENT,
        "database": "connected" if db_ok else "disconnected",
    }


@app.on_event("startup")
def startup_validation():
    errors = settings.validate()
    if errors:
        for err in errors:
            print(f"[CONFIG] ERROR: {err}", file=sys.stderr)
        if settings.is_production:
            print("[CONFIG] Fatal configuration errors in production — exiting", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=settings.DEBUG)
