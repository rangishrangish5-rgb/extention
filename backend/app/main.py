from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from .core.config import settings
from .core.security import security_headers, request_validator
from .api.endpoints import router as api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# Security middleware - Add security headers
@app.middleware("http")
async def add_security_headers_middleware(request: Request, call_next):
    return security_headers.add_security_headers(request, call_next)

# Request validation middleware
@app.middleware("http")
async def validate_request_middleware(request: Request, call_next):
    # Validate request size
    if not await request_validator.validate_request_size(request):
        from fastapi.responses import JSONResponse
        from starlette import status
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"error": "Request payload too large"}
        )
    
    # Validate User-Agent
    user_agent = request.headers.get("user-agent")
    if not request_validator.validate_user_agent(user_agent):
        from fastapi.responses import JSONResponse
        from starlette import status
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"error": "Invalid User-Agent"}
        )
    
    return await call_next(request)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    max_age=3600
)

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Include routers
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Secure Website Scanner API",
        "version": settings.VERSION,
        "security": "Enabled",
        "features": [
            "Firebase Authentication",
            "Rate Limiting",
            "Google Safe Browsing",
            "Input Validation",
            "Security Headers"
        ]
    }