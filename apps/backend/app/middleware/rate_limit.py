"""
Rate limiting middleware using slowapi.
"""
from fastapi import Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI


limiter = Limiter(key_func=get_remote_address)


def get_user_identifier(request: Request) -> str:
    """Use user ID if authenticated, else IP."""
    if hasattr(request.state, "user_id"):
        return str(request.state.user_id)
    return get_remote_address(request)


auth_limiter = Limiter(key_func=get_user_identifier)


def register_rate_limiter(app: FastAPI) -> None:
    """Register slowapi rate limiter to the FastAPI app."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
