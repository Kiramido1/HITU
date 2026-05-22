from fastapi import Request, HTTPException, status
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict
import asyncio


class RateLimiter:
    """Rate limiter using sliding window algorithm."""

    def __init__(self):
        # Store request timestamps per IP
        self.requests: Dict[str, list[datetime]] = defaultdict(list)
        # Lock for thread-safe operations
        self.lock = asyncio.Lock()

    async def is_allowed(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> bool:
        """Check if request is allowed based on rate limits."""
        async with self.lock:
            now = datetime.utcnow()
            window_start = now - timedelta(seconds=window_seconds)

            # Clean old requests
            self.requests[key] = [
                req_time for req_time in self.requests[key]
                if req_time > window_start
            ]

            # Check if under limit
            if len(self.requests[key]) >= max_requests:
                return False

            # Add current request
            self.requests[key].append(now)
            return True

    async def cleanup_old_entries(self, older_than_hours: int = 24):
        """Clean up old entries to prevent memory leaks."""
        async with self.lock:
            cutoff = datetime.utcnow() - timedelta(hours=older_than_hours)
            keys_to_remove = []

            for key, timestamps in self.requests.items():
                self.requests[key] = [
                    ts for ts in timestamps if ts > cutoff
                ]
                if not self.requests[key]:
                    keys_to_remove.append(key)

            for key in keys_to_remove:
                del self.requests[key]


# Global rate limiter instance
rate_limiter = RateLimiter()


async def rate_limit_middleware(
    request: Request,
    max_requests: int = 100,
    window_seconds: int = 60
):
    """Middleware to apply rate limiting."""
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"

    # Check rate limit
    allowed = await rate_limiter.is_allowed(
        key=client_ip,
        max_requests=max_requests,
        window_seconds=window_seconds
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
            headers={
                "Retry-After": str(window_seconds),
                "X-RateLimit-Limit": str(max_requests),
                "X-RateLimit-Window": str(window_seconds),
            }
        )


# Predefined rate limits for different endpoints
RATE_LIMITS = {
    "auth": {"max_requests": 5, "window_seconds": 60},  # 5 requests per minute for auth
    "api": {"max_requests": 100, "window_seconds": 60},  # 100 requests per minute for general API
    "export": {"max_requests": 10, "window_seconds": 300},  # 10 requests per 5 minutes for exports
}


async def get_rate_limit(endpoint_type: str) -> dict:
    """Get rate limit configuration for endpoint type."""
    return RATE_LIMITS.get(endpoint_type, RATE_LIMITS["api"])


async def apply_rate_limit(request: Request, endpoint_type: str = "api"):
    """Apply rate limiting based on endpoint type."""
    limits = await get_rate_limit(endpoint_type)
    await rate_limit_middleware(
        request=request,
        max_requests=limits["max_requests"],
        window_seconds=limits["window_seconds"]
    )
