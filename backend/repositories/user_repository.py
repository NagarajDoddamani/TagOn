from sqlalchemy.orm import Session
from typing import Optional
from models.user import User
from utils.pagination import paginate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, name: str, email: str, phone: str, password: str, role: str = "customer") -> User:
        user = User(name=name, email=email, phone=phone, password=password, role=role)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_email(self, email: str) -> User:
        return self.db.query(User).filter(User.email == email, User.is_deleted == False).first()

    def get_by_phone(self, phone: str) -> User:
        return self.db.query(User).filter(User.phone == phone, User.is_deleted == False).first()

    def get_by_id(self, user_id: str) -> User:
        return self.db.query(User).filter(User.id == user_id, User.is_deleted == False).first()

    def get_all_customers(self) -> list:
        return self.db.query(User).filter(User.role == "customer", User.is_deleted == False).all()

    def search_customers(self, search: Optional[str] = None, status: Optional[str] = None,
                         start_date: Optional[str] = None, end_date: Optional[str] = None,
                         page: Optional[int] = None, per_page: int = 20):
        query = self.db.query(User).filter(User.role == "customer", User.is_deleted == False)
        if search:
            pattern = f"%{search}%"
            query = query.filter(
                User.name.ilike(pattern) | User.email.ilike(pattern) | User.phone.ilike(pattern)
            )
        if status:
            query = query.filter(User.status == status)
        if start_date:
            query = query.filter(User.created_at >= start_date)
        if end_date:
            query = query.filter(User.created_at <= end_date)
        query = query.order_by(User.created_at.desc())
        if page is not None:
            return paginate(query, page=page, per_page=per_page)
        return query.all()

    def update_status(self, user: User, status: str) -> User:
        user.status = status
        self.db.commit()
        self.db.refresh(user)
        return user
