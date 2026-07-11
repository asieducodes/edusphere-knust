import cloudinary
import cloudinary.uploader

from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


async def upload_resource_file(file_bytes: bytes, filename: str, folder: str = "edusphere/resources") -> dict:
    """Upload a past question / note / avatar to Cloudinary.

    Returns the Cloudinary response dict, which includes `secure_url` and `public_id`
    to store against the resource row in Postgres.
    """
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        public_id=filename,
        resource_type="auto",
    )
    return result


async def delete_resource_file(public_id: str) -> dict:
    return cloudinary.uploader.destroy(public_id)
