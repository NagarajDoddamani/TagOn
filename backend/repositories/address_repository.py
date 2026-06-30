from sqlalchemy.orm import Session
from typing import Optional
from models.address import Address


class AddressRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: str) -> list:
        return (
            self.db.query(Address)
            .filter(Address.user_id == user_id)
            .order_by(Address.is_default.desc(), Address.created_at.desc())
            .all()
        )

    def get_by_id(self, address_id: str) -> Optional[Address]:
        return self.db.query(Address).filter(Address.id == address_id).first()

    def create(self, data: dict) -> Address:
        address = Address(**data)
        self.db.add(address)
        self.db.commit()
        self.db.refresh(address)
        return address

    def update(self, address: Address, data: dict) -> Address:
        for key, value in data.items():
            setattr(address, key, value)
        self.db.commit()
        self.db.refresh(address)
        return address

    def delete(self, address: Address):
        self.db.delete(address)
        self.db.commit()

    def set_default(self, user_id: str, address_id: str):
        self.db.query(Address).filter(
            Address.user_id == user_id
        ).update({"is_default": False})
        self.db.flush()
        address = self.get_by_id(address_id)
        if address:
            address.is_default = True
            self.db.commit()
            self.db.refresh(address)
        return address
