from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar('T')


class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: Optional[T] = None


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: list[T]
    pagination: PaginationMeta


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error: Optional[str] = None


def success(data: Any = None, message: str = "Request successful") -> dict:
    """Wrap any payload in the standard success envelope.

    Used directly in route handlers, e.g.:
        return success(data={"user": user_dict}, message="Login successful")
    """
    return {"success": True, "message": message, "data": data}


def paginated(items: list, page: int, limit: int, total: int, message: str = "Data fetched successfully") -> dict:
    total_pages = max(1, (total + limit - 1) // limit)
    return {
        "success": True,
        "message": message,
        "data": items,
        "pagination": {"page": page, "limit": limit, "total": total, "total_pages": total_pages},
    }