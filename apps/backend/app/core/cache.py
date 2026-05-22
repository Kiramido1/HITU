import json
import logging
from functools import wraps
from typing import Callable
from app.core.config import settings

logger = logging.getLogger("hitu.cache")

try:
    import redis.asyncio as redis
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    logger.warning(f"Redis not available, caching disabled: {e}")
    redis_client = None

def cache_response(expire: int = 60):
    """
    Cache decorator for FastAPI endpoints.
    Requires an active Redis connection.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not redis_client:
                return await func(*args, **kwargs)

            # Generate cache key
            kwargs_str = "_".join(f"{k}:{v}" for k, v in kwargs.items() if str(v))
            cache_key = f"hitu:cache:{func.__name__}:{kwargs_str}"

            try:
                cached_data = await redis_client.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)
            except Exception as e:
                logger.error(f"Redis get error: {e}")

            response = await func(*args, **kwargs)

            try:
                # Handle pydantic models or dicts
                if hasattr(response, "model_dump"):
                    data = response.model_dump()
                elif isinstance(response, list) and len(response) > 0 and hasattr(response[0], "model_dump"):
                    data = [item.model_dump() for item in response]
                else:
                    data = response

                await redis_client.setex(cache_key, expire, json.dumps(data))
            except Exception as e:
                logger.warning(f"Cache serialization error: {e}")

            return response
        return wrapper
    return decorator
