import re
from typing import Any, Optional
from fastapi import HTTPException, status
from pydantic import BaseModel, validator, EmailStr, Field


class SecurityValidator:
    """Security validation utilities."""

    # Password requirements
    MIN_PASSWORD_LENGTH = 8
    MAX_PASSWORD_LENGTH = 128
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGIT = True
    REQUIRE_SPECIAL = True

    # Input sanitization patterns
    SQL_INJECTION_PATTERN = re.compile(
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE)\b)",
        re.IGNORECASE
    )
    XSS_PATTERN = re.compile(
        r"<script.*?>.*?</script>|javascript:|on\w+\s*=|eval\(|expression\(",
        re.IGNORECASE
    )

    @classmethod
    def validate_password(cls, password: str) -> tuple[bool, Optional[str]]:
        """Validate password strength."""
        if len(password) < cls.MIN_PASSWORD_LENGTH:
            return False, f"Password must be at least {cls.MIN_PASSWORD_LENGTH} characters"

        if len(password) > cls.MAX_PASSWORD_LENGTH:
            return False, f"Password must not exceed {cls.MAX_PASSWORD_LENGTH} characters"

        if cls.REQUIRE_UPPERCASE and not re.search(r"[A-Z]", password):
            return False, "Password must contain at least one uppercase letter"

        if cls.REQUIRE_LOWERCASE and not re.search(r"[a-z]", password):
            return False, "Password must contain at least one lowercase letter"

        if cls.REQUIRE_DIGIT and not re.search(r"\d", password):
            return False, "Password must contain at least one digit"

        if cls.REQUIRE_SPECIAL and not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            return False, "Password must contain at least one special character"

        return True, None

    @classmethod
    def sanitize_input(cls, input_string: str) -> str:
        """Sanitize input to prevent SQL injection and XSS."""
        if not input_string:
            return input_string

        # Remove potential SQL injection patterns
        sanitized = cls.SQL_INJECTION_PATTERN.sub("", input_string)

        # Remove potential XSS patterns
        sanitized = cls.XSS_PATTERN.sub("", sanitized)

        # Remove null bytes
        sanitized = sanitized.replace("\x00", "")

        return sanitized

    @classmethod
    def validate_email(cls, email: str) -> tuple[bool, Optional[str]]:
        """Validate email format."""
        email_pattern = re.compile(
            r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        )

        if not email_pattern.match(email):
            return False, "Invalid email format"

        return True, None

    @classmethod
    def validate_phone(cls, phone: str) -> tuple[bool, Optional[str]]:
        """Validate phone number format."""
        # Accept various formats: +20 123 456 7890, 01234567890, etc.
        phone_pattern = re.compile(r"^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$")

        if not phone_pattern.match(phone):
            return False, "Invalid phone number format"

        return True, None

    @classmethod
    def validate_url(cls, url: str) -> tuple[bool, Optional[str]]:
        """Validate URL format."""
        url_pattern = re.compile(
            r"^https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}"
            r"\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)$"
        )

        if not url_pattern.match(url):
            return False, "Invalid URL format"

        return True, None


# Pydantic models with validation
class UserCreateSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=100)

    @validator('password')
    def validate_password_strength(cls, v):
        is_valid, error = SecurityValidator.validate_password(v)
        if not is_valid:
            raise ValueError(error)
        return v

    @validator('full_name')
    def sanitize_name(cls, v):
        return SecurityValidator.sanitize_input(v)


class UserUpdateSchema(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None

    @validator('full_name')
    def sanitize_name(cls, v):
        if v:
            return SecurityValidator.sanitize_input(v)
        return v

    @validator('phone')
    def validate_phone_number(cls, v):
        if v:
            is_valid, error = SecurityValidator.validate_phone(v)
            if not is_valid:
                raise ValueError(error)
        return v


class CourseCreateSchema(BaseModel):
    code: str = Field(..., min_length=3, max_length=20)
    name: str = Field(..., min_length=3, max_length=200)
    credits: int = Field(..., ge=1, le=10)
    department: str = Field(..., min_length=2, max_length=100)

    @validator('code', 'name', 'department')
    def sanitize_fields(cls, v):
        return SecurityValidator.sanitize_input(v)


class HallCreateSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    capacity: int = Field(..., ge=1, le=500)
    building: str = Field(..., min_length=2, max_length=100)

    @validator('name', 'building')
    def sanitize_fields(cls, v):
        return SecurityValidator.sanitize_input(v)


def validate_request_data(data: dict, schema_class: type[BaseModel]) -> BaseModel:
    """Validate request data against a schema."""
    try:
        return schema_class(**data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


def check_for_malicious_input(data: Any) -> None:
    """Check for malicious input patterns."""
    if isinstance(data, str):
        sanitized = SecurityValidator.sanitize_input(data)
        if sanitized != data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Input contains potentially malicious content"
            )
    elif isinstance(data, dict):
        for key, value in data.items():
            check_for_malicious_input(value)
    elif isinstance(data, list):
        for item in data:
            check_for_malicious_input(item)
