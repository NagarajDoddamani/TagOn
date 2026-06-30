from sqlalchemy.orm import Session
from core.exceptions import NotFoundException, ForbiddenException
from repositories.address_repository import AddressRepository


class AddressService:
    def __init__(self, db: Session):
        self.db = db
        self.address_repo = AddressRepository(db)

    def get_user_addresses(self, user_id: str) -> list:
        return self.address_repo.get_by_user(user_id)

    def create_address(self, user_id: str, data: dict) -> dict:
        address = self.address_repo.create({**data, "user_id": user_id})
        return self._to_dict(address)

    def update_address(self, user_id: str, address_id: str, data: dict) -> dict:
        address = self.address_repo.get_by_id(address_id)
        if not address:
            raise NotFoundException("Address not found")
        if str(address.user_id) != user_id:
            raise ForbiddenException("Not authorized to update this address")
        updated = self.address_repo.update(address, data)
        return self._to_dict(updated)

    def delete_address(self, user_id: str, address_id: str):
        address = self.address_repo.get_by_id(address_id)
        if not address:
            raise NotFoundException("Address not found")
        if str(address.user_id) != user_id:
            raise ForbiddenException("Not authorized to delete this address")
        self.address_repo.delete(address)

    def set_default(self, user_id: str, address_id: str) -> dict:
        address = self.address_repo.get_by_id(address_id)
        if not address:
            raise NotFoundException("Address not found")
        if str(address.user_id) != user_id:
            raise ForbiddenException("Not authorized to modify this address")
        updated = self.address_repo.set_default(user_id, address_id)
        return self._to_dict(updated)

    def _to_dict(self, address) -> dict:
        return {
            "id": str(address.id),
            "recipient_name": address.recipient_name,
            "mobile": address.mobile,
            "address_line": address.address_line,
            "city": address.city,
            "state": address.state,
            "postal_code": address.postal_code,
            "landmark": address.landmark,
            "is_default": address.is_default,
            "created_at": address.created_at.isoformat() if address.created_at else None,
        }
