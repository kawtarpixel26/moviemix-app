from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    """Data li kaysifet user f register."""

    email: EmailStr
    username: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_]+$")
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, v: str) -> str:
        # bcrypt ma kayqbelch passwords kbar mn 72 bytes
        if len(v.encode()) > 72:
            raise ValueError("Password is too long")
        return v


class UserOut(BaseModel):
    """Data li katrje3 l frontend (bla password)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    username: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class GoogleLogin(BaseModel):
    """ID token (JWT) li kay3tih Google l frontend mlli user ydir 'Continue with Google'."""

    credential: str = Field(min_length=20, max_length=4096)
