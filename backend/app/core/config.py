from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Secure Website Scanner API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Firebase
    FIREBASE_PROJECT_ID: str
    FIREBASE_PRIVATE_KEY: str
    FIREBASE_CLIENT_EMAIL: str
    
    # Google Safe Browsing
    GOOGLE_API_KEY: str
    
    # Upstash Redis (for rate limiting)
    UPSTASH_REDIS_REST_URL: str
    UPSTASH_REDIS_REST_TOKEN: str
    
    # Rate limiting
    RATE_LIMIT_PER_DAY: int = 10
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["chrome-extension://*"]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Render specific
    RENDER: bool = os.getenv('RENDER', 'false').lower() == 'true'
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()