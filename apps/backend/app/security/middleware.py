from json import JSONDecodeError
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import logging
from typing import Callable
from .jwt_manager import decode_token, is_token_blacklisted
from .rate_limiter import apply_rate_limit
from .validator import check_for_malicious_input

logger = logging.getLogger(__name__)


class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for request validation and protection."""

    async def dispatch(self, request: Request, call_next: Callable):
        # Skip security checks for health endpoints
        if request.url.path in ["/health", "/docs", "/openapi.json"]:
            return await call_next(request)

        try:
            # Apply rate limiting
            endpoint_type = self._get_endpoint_type(request.url.path)
            await apply_rate_limit(request, endpoint_type)

            # Validate request body if present
            if request.method in ["POST", "PUT", "PATCH"]:
                try:
                    body = await request.json()
                    check_for_malicious_input(body)
                except (JSONDecodeError, ValueError):
                    pass

            # Process request
            response = await call_next(request)

            # Add security headers
            self._add_security_headers(response)

            return response

        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail}
            )
        except Exception as e:
            logger.error(f"Security middleware error: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error"}
            )

    def _get_endpoint_type(self, path: str) -> str:
        """Determine endpoint type for rate limiting."""
        if "/auth" in path:
            return "auth"
        elif "/export" in path:
            return "export"
        else:
            return "api"

    def _add_security_headers(self, response):
        """Add security headers to response."""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Authentication middleware for protected routes."""

    def __init__(self, app, public_paths: list[str] = None):
        super().__init__(app)
        self.public_paths = public_paths or [
            "/",
            "/login",
            "/register",
            "/health",
            "/docs",
            "/openapi.json",
        ]

    async def dispatch(self, request: Request, call_next: Callable):
        # Skip authentication for public paths
        if any(request.url.path.startswith(path) for path in self.public_paths):
            return await call_next(request)

        # Check for authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing or invalid authorization header"}
            )

        token = auth_header.split(" ")[1]

        try:
            # Decode and validate token
            payload = decode_token(token)

            # Check if token is blacklisted
            if is_token_blacklisted(token):
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Token has been revoked"}
                )

            # Add user info to request state
            request.state.user_id = payload.get("sub")
            request.state.token_type = payload.get("type")

            # Process request
            return await call_next(request)

        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid or expired token"}
            )


class LoggingMiddleware(BaseHTTPMiddleware):
    """Logging middleware for security audit."""

    async def dispatch(self, request: Request, call_next: Callable):
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )

        # Process request
        response = await call_next(request)

        # Log response
        logger.info(
            f"Response: {response.status_code} "
            f"for {request.method} {request.url.path}"
        )

        return response
