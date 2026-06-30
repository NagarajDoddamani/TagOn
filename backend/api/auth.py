from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, sanitize_input, validate_password_strength
from core.rate_limiter import auth_rate_limit
from schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from services.auth_service import AuthService
from models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
    _=Depends(auth_rate_limit),
):
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    pw_errors = validate_password_strength(request.password)
    if pw_errors:
        raise HTTPException(status_code=400, detail="; ".join(pw_errors))
    request.name = sanitize_input(request.name, max_length=100)
    service = AuthService(db)
    return service.register(
        name=request.name,
        email=request.email,
        phone=request.phone,
        password=request.password,
    )


@router.post("/login", response_model=AuthResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
    _=Depends(auth_rate_limit),
):
    service = AuthService(db)
    return service.login(email=request.email, password=request.password)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    if current_user.name:
        current_user.name = sanitize_input(current_user.name)
    return current_user
