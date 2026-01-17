from upstash_redis import Redis
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from .config import settings
import json

class RateLimiter:
    def __init__(self):
        self.redis_client = Redis(url=settings.UPSTASH_REDIS_REST_URL, token=settings.UPSTASH_REDIS_REST_TOKEN)
        self.daily_limit = settings.RATE_LIMIT_PER_DAY
    
    def get_user_key(self, user_id: str) -> str:
        today = datetime.utcnow().date().isoformat()
        return f"user:{user_id}:scans:{today}"
    
    async def check_rate_limit(self, user_id: str) -> bool:
        """Check if user has exceeded daily scan limit"""
        try:
            key = self.get_user_key(user_id)
            current_count = self.redis_client.get(key)
            
            if current_count is None:
                # First scan today
                self.redis_client.set(key, "1", ex=86400)  # 24 hours TTL
                return True
            
            count = int(current_count)
            if count >= self.daily_limit:
                return False
            
            # Increment count
            self.redis_client.incr(key)
            return True
            
        except Exception as e:
            print(f"Redis error: {e}")
            # Allow on Redis failure
            return True
    
    async def get_user_stats(self, user_id: str) -> dict:
        """Get user's scan statistics"""
        try:
            key = self.get_user_key(user_id)
            count = self.redis_client.get(key)
            
            return {
                "scans_today": int(count) if count else 0,
                "daily_limit": self.daily_limit,
                "remaining": max(0, self.daily_limit - (int(count) if count else 0))
            }
        except Exception as e:
            return {
                "scans_today": 0,
                "daily_limit": self.daily_limit,
                "remaining": self.daily_limit,
                "error": str(e)
            }