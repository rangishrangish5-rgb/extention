"""
Dependency injection module for FastAPI endpoints.
Contains reusable dependencies for authentication, rate limiting, and more.
"""
from datetime import datetime 
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json

from ..services.firebase import verify_firebase_token
from ..core.rate_limiter import RateLimiter
from ..core.config import settings

# Initialize dependencies
security = HTTPBearer(auto_error=False)
rate_limiter = RateLimiter()


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> Dict[str, Any]:
    """
    Dependency to get current authenticated user.
    Validates Firebase token and returns user info.
    
    Args:
        credentials: HTTP Bearer token from Authorization header
    
    Returns:
        Dict containing user information (uid, email, etc.)
    
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user = await verify_firebase_token(credentials.credentials)
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> Optional[Dict[str, Any]]:
    """
    Dependency to get current user (optional).
    Returns user info if authenticated, None otherwise.
    
    Args:
        credentials: HTTP Bearer token from Authorization header
    
    Returns:
        User info dict if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        user = await verify_firebase_token(credentials.credentials)
        return user
    except Exception:
        return None


async def check_rate_limit(
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Dependency to check rate limit for authenticated user.
    
    Args:
        user: Authenticated user from get_current_user dependency
    
    Returns:
        User info if rate limit not exceeded
    
    Raises:
        HTTPException: If rate limit exceeded
    """
    user_id = user["uid"]
    
    # Check rate limit
    can_proceed = await rate_limiter.check_rate_limit(user_id)
    
    if not can_proceed:
        # Get user stats for error message
        stats = await rate_limiter.get_user_stats(user_id)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": "Daily scan limit reached",
                "limit": settings.RATE_LIMIT_PER_DAY,
                "used": stats.get("scans_today", 0),
                "remaining": stats.get("remaining", 0),
                "reset_time": "24 hours"
            }
        )
    
    return user


async def validate_url(url: str) -> str:
    """
    Dependency to validate URL format.
    
    Args:
        url: URL to validate
    
    Returns:
        Cleaned URL
    
    Raises:
        HTTPException: If URL is invalid
    """
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL is required"
        )
    
    # Basic URL validation
    url = url.strip()
    
    # Check if URL has protocol
    if not url.startswith(('http://', 'https://')):
        # Try to add https://
        url = f"https://{url}"
    
    # Simple validation
    if len(url) > 2048:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL is too long (max 2048 characters)"
        )
    
    # Check for common issues
    if ' ' in url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL cannot contain spaces"
        )
    
    return url


async def get_user_stats(
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Dependency to get user statistics including rate limit info.
    
    Args:
        user: Authenticated user
    
    Returns:
        Dict with user info and statistics
    """
    user_id = user["uid"]
    stats = await rate_limiter.get_user_stats(user_id)
    
    return {
        "user": {
            "uid": user["uid"],
            "email": user.get("email"),
            "email_verified": user.get("email_verified", False)
        },
        "rate_limit": {
            "scans_today": stats.get("scans_today", 0),
            "daily_limit": stats.get("daily_limit", settings.RATE_LIMIT_PER_DAY),
            "remaining": stats.get("remaining", settings.RATE_LIMIT_PER_DAY),
            "percentage_used": (
                (stats.get("scans_today", 0) / settings.RATE_LIMIT_PER_DAY) * 100
                if settings.RATE_LIMIT_PER_DAY > 0 else 0
            )
        }
    }


async def get_request_metadata(
    user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
) -> Dict[str, Any]:
    """
    Dependency to collect request metadata for logging/analytics.
    
    Args:
        user: Optional user info
    
    Returns:
        Request metadata
    """
    import time
    from datetime import datetime
    
    metadata = {
        "timestamp": datetime.utcnow().isoformat(),
        "timestamp_epoch": int(time.time()),
        "authenticated": user is not None,
        "user_agent": None,  # Could be extracted from request headers
    }
    
    if user:
        metadata.update({
            "user_id": user.get("uid"),
            "user_email": user.get("email"),
            "email_verified": user.get("email_verified", False)
        })
    
    return metadata


class RateLimitHeaders:
    """Dependency to add rate limit headers to response."""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
    
    async def __call__(self) -> Dict[str, str]:
        """Get rate limit headers for the current user."""
        stats = await rate_limiter.get_user_stats(self.user_id)
        
        return {
            "X-RateLimit-Limit": str(settings.RATE_LIMIT_PER_DAY),
            "X-RateLimit-Remaining": str(stats.get("remaining", settings.RATE_LIMIT_PER_DAY)),
            "X-RateLimit-Reset": "86400",  # 24 hours in seconds
            "X-RateLimit-Used": str(stats.get("scans_today", 0))
        }


async def validate_scan_request(
    request_data: Dict[str, Any],
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Dependency to validate scan request with all necessary checks.
    
    Args:
        request_data: Request body data
        user: Authenticated user
    
    Returns:
        Validated request data
    
    Raises:
        HTTPException: If validation fails
    """
    # Check if URL is present
    if "url" not in request_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL is required in request body"
        )
    
    url = request_data["url"]
    
    # Validate URL format
    if not isinstance(url, str) or not url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL must be a non-empty string"
        )
    
    # Clean URL
    url = url.strip()
    
    # Add protocol if missing
    if not url.startswith(('http://', 'https://')):
        url = f"https://{url}"
    
    # Additional validation
    if len(url) > 2048:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL is too long (maximum 2048 characters)"
        )
    
    # Check for blocked URLs (internal/private)
    blocked_prefixes = [
        'chrome://',
        'chrome-extension://',
        'file://',
        'localhost',
        '127.0.0.1',
        '192.168.',
        '10.',
        '172.16.',
        '::1'
    ]
    
    if any(url.lower().startswith(prefix) for prefix in blocked_prefixes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot scan internal/private URLs"
        )
    
    # Check rate limit
    user_id = user["uid"]
    can_proceed = await rate_limiter.check_rate_limit(user_id)
    
    if not can_proceed:
        stats = await rate_limiter.get_user_stats(user_id)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "message": f"You have exceeded the daily limit of {settings.RATE_LIMIT_PER_DAY} scans",
                "limit": settings.RATE_LIMIT_PER_DAY,
                "used": stats.get("scans_today", 0),
                "remaining": stats.get("remaining", 0),
                "reset": "Resets in 24 hours"
            }
        )
    
    # Return validated data
    return {
        "url": url,
        "user_id": user_id,
        "user_email": user.get("email"),
        "timestamp": datetime.utcnow().isoformat()
    }


async def get_api_key(
    api_key: Optional[str] = None
) -> Optional[str]:
    """
    Dependency for API key authentication (for internal services).
    
    Args:
        api_key: API key from query parameter or header
    
    Returns:
        API key if valid, None otherwise
    
    Note: This is for future use if you need internal API access
    """
    if not api_key:
        return None
    
    # Validate API key (you can implement your own validation logic)
    valid_api_keys = []  # Add your valid API keys here
    
    if api_key in valid_api_keys:
        return api_key
    
    return None


# Request/Response models for better type hints
from pydantic import BaseModel, Field, validator, HttpUrl
from typing import List


class ScanRequest(BaseModel):
    """Request model for URL scanning."""
    url: str = Field(
        ...,
        description="URL to scan for threats",
        example="https://example.com",
        min_length=1,
        max_length=2048
    )
    
    @validator('url')
    def validate_url(cls, v):
        """Validate URL format."""
        v = v.strip()
        if not v:
            raise ValueError("URL cannot be empty")
        
        # Check for protocol
        if not v.startswith(('http://', 'https://')):
            v = f"https://{v}"
        
        # Basic validation
        if ' ' in v:
            raise ValueError("URL cannot contain spaces")
        
        # Check length
        if len(v) > 2048:
            raise ValueError("URL is too long (max 2048 characters)")
        
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "url": "https://example.com"
            }
        }


class ScanResponse(BaseModel):
    """Response model for URL scanning."""
    status: str = Field(
        ...,
        description="Scan status: 'safe' or 'dangerous'",
        example="safe"
    )
    matches: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of threat matches if any"
    )
    threats_found: int = Field(
        ...,
        description="Number of threats found",
        example=0
    )
    user_id: str = Field(
        ...,
        description="User ID who requested the scan"
    )
    timestamp: str = Field(
        ...,
        description="ISO timestamp of scan"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "status": "safe",
                "matches": [],
                "threats_found": 0,
                "user_id": "user123",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class RateLimitResponse(BaseModel):
    """Response model for rate limit information."""
    scans_today: int = Field(
        ...,
        description="Number of scans performed today",
        example=3
    )
    daily_limit: int = Field(
        ...,
        description="Daily scan limit",
        example=10
    )
    remaining: int = Field(
        ...,
        description="Remaining scans for today",
        example=7
    )
    percentage_used: float = Field(
        ...,
        description="Percentage of daily limit used",
        example=30.0
    )
    
    class Config:
        schema_extra = {
            "example": {
                "scans_today": 3,
                "daily_limit": 10,
                "remaining": 7,
                "percentage_used": 30.0
            }
        }


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str = Field(
        ...,
        description="Error message",
        example="Authentication failed"
    )
    detail: Optional[str] = Field(
        None,
        description="Detailed error information"
    )
    code: Optional[str] = Field(
        None,
        description="Error code"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "error": "Rate limit exceeded",
                "detail": "You have used all 10 scans for today",
                "code": "RATE_LIMIT_EXCEEDED"
            }
        }


# Export commonly used dependencies
__all__ = [
    "get_current_user",
    "get_current_user_optional",
    "check_rate_limit",
    "validate_url",
    "get_user_stats",
    "validate_scan_request",
    "ScanRequest",
    "ScanResponse",
    "RateLimitResponse",
    "ErrorResponse",
    "security",
    "rate_limiter"
]