from sqlalchemy.orm import Session
from core.security import hash_password, verify_password, create_access_token
from core.exceptions import DuplicateException, UnauthorizedException
from repositories.user_repository import UserRepository
from repositories.activity_log_repository import ActivityLogRepository


class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.log_repo = ActivityLogRepository(db)

    def register(self, name: str, email: str, phone: str, password: str):
        if self.user_repo.get_by_email(email):
            raise DuplicateException("Email already registered")
        if self.user_repo.get_by_phone(phone):
            raise DuplicateException("Phone number already registered")

        hashed = hash_password(password)
        user = self.user_repo.create(name=name, email=email, phone=phone, password=hashed, role="customer")

        self.log_repo.create(
            user_id=str(user.id),
            action="registration",
            entity_type="user",
            entity_id=str(user.id),
            details=f"Customer registered: {email}",
        )

        token = create_access_token({"user_id": str(user.id), "role": user.role})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
            },
        }

    def login(self, email: str, password: str):
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password):
            raise UnauthorizedException("Invalid email or password")

        self.log_repo.create(
            user_id=str(user.id),
            action="login",
            entity_type="user",
            entity_id=str(user.id),
        )

        token = create_access_token({"user_id": str(user.id), "role": user.role})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
            },
        }

    def get_profile(self, user_id: str):
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException("User not found")
        return {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "status": user.status,
        }
