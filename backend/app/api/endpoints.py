from datetime import datetime 
from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import Dict, Any
from .dependencies import (
    get_current_user,
    validate_scan_request,
    get_user_stats,
    ScanRequest,
    ScanResponse,
    RateLimitResponse,
    ErrorResponse,
    security
)
from ..services.scanner import SafeBrowsingScanner

router = APIRouter()
scanner = SafeBrowsingScanner()

@router.post(
    "/scan",
    response_model=ScanResponse,
    responses={
        200: {"description": "Scan completed successfully"},
        400: {"model": ErrorResponse, "description": "Invalid request"},
        401: {"model": ErrorResponse, "description": "Authentication required"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def scan_website(
    scan_request: ScanRequest = Body(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Scan a website URL for threats using Google Safe Browsing API.
    
    - **url**: URL to scan (required)
    - Returns scan results with threat information
    - Rate limited to 10 scans per day per user
    - Requires valid Firebase authentication token
    """
    # Validate scan request (includes rate limiting check)
    validated_data = await validate_scan_request(
        {"url": scan_request.url},
        user
    )
    
    # Scan URL
    scan_result = await scanner.scan_url(validated_data["url"])
    
    return {
        "status": scan_result["status"],
        "matches": scan_result.get("matches", []),
        "threats_found": scan_result.get("threats_found", 0),
        "user_id": user["uid"],
        "timestamp": validated_data["timestamp"]
    }

@router.get(
    "/stats",
    response_model=Dict[str, Any],
    responses={
        200: {"description": "User statistics retrieved"},
        401: {"model": ErrorResponse, "description": "Authentication required"}
    }
)
async def get_stats(
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get user scan statistics and rate limit information.
    
    - Returns current scan usage and limits
    - Requires valid Firebase authentication token
    """
    stats = await get_user_stats(user)
    return stats

@router.get(
    "/health",
    response_model=Dict[str, Any]
)
async def health_check():
    """
    Health check endpoint.
    
    - Returns service status and version
    - No authentication required
    """
    import redis
    from ..core.config import settings
    
    health_status = {
        "status": "healthy",
        "service": "Secure Website Scanner API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Check Redis connection
    try:
        redis_client = redis.from_url(settings.REDIS_URL)
        redis_client.ping()
        health_status["redis"] = "connected"
    except Exception as e:
        health_status["redis"] = f"error: {str(e)}"
    
    # Check Firebase connection (basic check)
    try:
        health_status["firebase"] = "configured"
    except Exception as e:
        health_status["firebase"] = f"error: {str(e)}"
    
    return health_status

@router.get(
    "/limits",
    response_model=RateLimitResponse,
    responses={
        200: {"description": "Rate limit information"},
        401: {"model": ErrorResponse, "description": "Authentication required"}
    }
)
async def get_rate_limits(
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get detailed rate limit information.
    
    - Returns current usage and limits
    - Requires valid Firebase authentication token
    """
    from ..core.rate_limiter import RateLimiter
    from ..core.config import settings
    
    rate_limiter = RateLimiter()
    stats = await rate_limiter.get_user_stats(user["uid"])
    
    return {
        "scans_today": stats.get("scans_today", 0),
        "daily_limit": stats.get("daily_limit", settings.RATE_LIMIT_PER_DAY),
        "remaining": stats.get("remaining", settings.RATE_LIMIT_PER_DAY),
        "percentage_used": (
            (stats.get("scans_today", 0) / settings.RATE_LIMIT_PER_DAY) * 100
            if settings.RATE_LIMIT_PER_DAY > 0 else 0
        )
    }