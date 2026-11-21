"""Verification dyal ID token li kayjibo "Sign in with Google" f frontend."""

import jwt
from jwt import PyJWKClient

from app.core.config import settings

GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ISSUERS = ("accounts.google.com", "https://accounts.google.com")

# Kaydir cache l-keys dyal Google (ma kayjibhomch f kol request)
_jwks_client = PyJWKClient(GOOGLE_CERTS_URL, cache_keys=True)


class GoogleAuthError(Exception):
    pass


def verify_google_token(credential: str) -> dict:
    """
    Kat-verifyi signature, audience (Client ID dyalna), issuer w expiration.
    Katrdd claims (email, name, sub...) wla katlo7 GoogleAuthError.
    """
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(credential)
        claims = jwt.decode(
            credential,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.google_client_id,
            options={"require": ["exp", "iss", "aud", "sub"]},
        )
    except jwt.PyJWTError as exc:
        raise GoogleAuthError("Invalid Google token") from exc

    if claims.get("iss") not in GOOGLE_ISSUERS:
        raise GoogleAuthError("Invalid Google token issuer")
    if not claims.get("email") or not claims.get("email_verified"):
        raise GoogleAuthError("Google account email is not verified")
    return claims
