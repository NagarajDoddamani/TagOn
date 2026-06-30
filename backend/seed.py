"""Seed script to create the initial administrator account."""
from core.database import SessionLocal
from core.security import hash_password
from core.config import settings
from repositories.user_repository import UserRepository


def seed_admin():
    db = SessionLocal()
    try:
        repo = UserRepository(db)
        admin = repo.get_by_email(settings.ADMIN_EMAIL)
        if admin:
            print("Admin user already exists.")
            return

        hashed_pw = hash_password(settings.ADMIN_PASSWORD)
        repo.create(
            name=settings.ADMIN_NAME,
            email=settings.ADMIN_EMAIL,
            phone=settings.ADMIN_PHONE,
            password=hashed_pw,
            role="admin",
        )
        print("Admin user created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
