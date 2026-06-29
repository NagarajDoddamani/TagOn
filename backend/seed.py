"""Seed script to create the initial administrator account."""
from core.database import SessionLocal, engine, Base
from core.security import hash_password
from models.user import User
from core.config import settings


def seed_admin():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if admin:
            print("Admin account already exists")
            return

        admin = User(
            name=settings.ADMIN_NAME,
            email=settings.ADMIN_EMAIL,
            phone="0000000000",
            password=hash_password(settings.ADMIN_PASSWORD),
            role="admin",
            status="active",
        )
        db.add(admin)
        db.commit()
        print("Admin account created successfully")
        print(f"Email: {settings.ADMIN_EMAIL}")
        print(f"Password: {settings.ADMIN_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
