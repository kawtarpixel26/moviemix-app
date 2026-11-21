import re

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.google import GoogleAuthError, verify_google_token
from app.core.security import create_access_token, hash_password, verify_password
from app.db import get_db
from app.models import User
from app.schemas import GoogleLogin, Token, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.scalar(
        select(User).where(
            or_(User.email == data.email, User.username == data.username)
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered",
        )

    user = User(
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # ila jouj d requests tsjjlo f nfs l-waqt b nfs email/username
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered",
        )
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Login b email WLA username f field 'username', w password."""
    identifier = form.username.strip()
    user = db.scalar(
        select(User).where(
            or_(User.email == identifier.lower(), User.username == identifier)
        )
    )
    # user li dkhel ghir b Google ma 3ndouch password
    if (
        not user
        or not user.hashed_password
        or not verify_password(form.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return Token(access_token=create_access_token(str(user.id)))


def _unique_username(db: Session, email: str) -> str:
    """Username mn email (ghir 7rouf, ar9am w _), m3a ra9m ila kan deja mkhdoum."""
    base = re.sub(r"[^A-Za-z0-9_]", "_", email.split("@")[0])[:40].strip("_")
    base = base if len(base) >= 3 else f"user_{base}".rstrip("_")
    candidate, n = base, 1
    while db.scalar(select(User.id).where(User.username == candidate)):
        n += 1
        candidate = f"{base}{n}"
    return candidate


@router.post("/google", response_model=Token)
def google_login(data: GoogleLogin, db: Session = Depends(get_db)):
    """
    "Continue with Google": kan-verifyiw token dyal Google, mn b3d
    kanl9aw user b email dyalou wla kansaybouh, w kanrddo JWT dyalna.
    """
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sign-in is not configured",
        )
    try:
        claims = verify_google_token(data.credential)
    except GoogleAuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    email = claims["email"].lower()
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        user = User(email=email, username=_unique_username(db, email), hashed_password=None)
        db.add(user)
        try:
            db.commit()
        except IntegrityError:
            # jouj d requests f nfs l-waqt: nakhdo user li tsayeb
            db.rollback()
            user = db.scalar(select(User).where(User.email == email))
            if not user:
                raise HTTPException(status_code=409, detail="Please try again")
        else:
            db.refresh(user)

    return Token(access_token=create_access_token(str(user.id)))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
