"""
Async file upload utilities — validation, storage, cleanup.
"""
import uuid
import aiofiles
from pathlib import Path
from typing import Optional, Tuple

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

UPLOAD_BASE = Path(settings.UPLOAD_DIR)


async def save_upload(
    file: UploadFile,
    sub_dir: str = "general",
    max_size_mb: Optional[int] = None,
) -> Tuple[str, str, int, str]:
    """
    Validate and save an uploaded file.
    Returns: (file_url, file_name, file_size_bytes, mime_type)
    """
    if max_size_mb is None:
        max_size_mb = settings.MAX_FILE_SIZE_MB

    # Validate extension
    ext = Path(file.filename or "").suffix.lstrip(".").lower()
    if ext not in settings.allowed_extensions_set:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type '.{ext}' is not allowed. Allowed: {', '.join(settings.allowed_extensions_set)}",
        )

    # Read and check size
    content = await file.read()
    size = len(content)
    max_bytes = max_size_mb * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed: {max_size_mb}MB",
        )

    # Generate unique path
    upload_dir = UPLOAD_BASE / sub_dir
    upload_dir.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    dest = upload_dir / unique_name

    async with aiofiles.open(dest, "wb") as f:
        await f.write(content)

    file_url = f"/uploads/{sub_dir}/{unique_name}"
    mime = file.content_type or "application/octet-stream"
    return file_url, file.filename or unique_name, size, mime


async def delete_file(file_url: str) -> bool:
    """Delete a stored file. Returns True if deleted."""
    relative = file_url.lstrip("/")
    path = UPLOAD_BASE.parent / relative
    if path.exists():
        path.unlink()
        return True
    return False
