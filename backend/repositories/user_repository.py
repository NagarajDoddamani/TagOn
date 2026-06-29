from sqlalchemy.orm import Session
from models.user import User


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
