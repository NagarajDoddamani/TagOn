from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from core.security import get_current_user
from core.cloudinary import upload_image, delete_image
from models.user import User

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_upload(file: UploadFile):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Allowed: JPEG, PNG, WebP, GIF",
        )
    unsafe_chars = set("<>:\"/\\|?*")
    if unsafe_chars.intersection(file.filename or ""):
        raise HTTPException(status_code=400, detail="Invalid filename")


router = APIRouter(prefix="/api/uploads", tags=["Uploads"])


@router.post("/image")
async def upload_image_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    validate_upload(file)
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum of {MAX_FILE_SIZE // (1024*1024)} MB",
        )
    await file.seek(0)
    result = upload_image(file, folder="tagon/uploads")
    return result


@router.post("/delete")
def delete_uploaded_image(public_id: str, current_user: User = Depends(get_current_user)):
    delete_image(public_id)
    return {"message": "Image deleted"}
