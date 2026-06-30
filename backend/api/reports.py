from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime
from core.database import get_db
from core.security import require_admin
from models.user import User
from services.report_service import ReportService

router = APIRouter(prefix="/api/admin/reports", tags=["Admin Reports"])

VALID_TYPES = {"orders", "payments", "revenue", "customers", "products"}
VALID_FORMATS = {"csv", "xlsx", "pdf"}


@router.get("/{report_type}")
def download_report(
    report_type: str,
    fmt: str = Query("csv", description="Output format: csv, xlsx, pdf"),
    start_date: str = Query(None, description="YYYY-MM-DD"),
    end_date: str = Query(None, description="YYYY-MM-DD"),
    status: str = Query(None, description="Order or product status filter"),
    category_id: str = Query(None, description="Product category filter"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if report_type not in VALID_TYPES:
        return Response(
            f"Invalid report type. Valid: {', '.join(sorted(VALID_TYPES))}",
            status_code=400,
        )
    if fmt not in VALID_FORMATS:
        return Response(
            f"Invalid format. Valid: {', '.join(sorted(VALID_FORMATS))}",
            status_code=400,
        )

    filters = {}
    if start_date:
        filters["start_date"] = datetime.fromisoformat(start_date)
    if end_date:
        filters["end_date"] = datetime.fromisoformat(end_date)
    if status:
        filters["status"] = status
    if category_id:
        filters["category_id"] = category_id

    service = ReportService(db)
    (content, filename), content_type = service.generate(report_type, fmt, **filters)

    return Response(
        content=content,
        media_type=content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(content)),
        },
    )
