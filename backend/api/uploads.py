from fastapi import APIRouter, Depends, UploadFile, File
from core.security import get_current_user
from core.cloudinary import upload_image, delete_image
from models.user import User

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])


@router.post("/image")
def upload_image_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    result = upload_image(file, folder="tagon/uploads")
    return result


@router.post("/delete")
def delete_uploaded_image(public_id: str, current_user: User = Depends(get_current_user)):
    delete_image(public_id)
    return {"message": "Image deleted"}
