from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models.user import User
from schemas.address import AddressCreate, AddressUpdate, AddressResponse
from services.address_service import AddressService
from typing import List

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])


@router.get("", response_model=List[AddressResponse])
def get_addresses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AddressService(db)
    return service.get_user_addresses(str(current_user.id))


@router.post("", response_model=AddressResponse)
def create_address(
    request: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AddressService(db)
    return service.create_address(str(current_user.id), request.model_dump())


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: str,
    request: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AddressService(db)
    data = {k: v for k, v in request.model_dump().items() if v is not None}
    return service.update_address(str(current_user.id), address_id, data)


@router.delete("/{address_id}")
def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AddressService(db)
    service.delete_address(str(current_user.id), address_id)
    return {"message": "Address deleted successfully"}


@router.put("/{address_id}/default", response_model=AddressResponse)
def set_default_address(
    address_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AddressService(db)
    return service.set_default(str(current_user.id), address_id)
