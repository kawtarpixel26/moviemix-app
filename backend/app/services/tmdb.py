"""Client sghir l TMDB: kayzid l-key, kaydir cache, w kayhandli les erreurs."""

import time
from typing import Any

import httpx

from app.core.config import settings

TMDB_BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

# Cache sghir f mémoire: key -> (waqt li kaysali fih, data)
_cache: dict[str, tuple[float, Any]] = {}
_CACHE_MAX_ITEMS = 500

_client: httpx.AsyncClient | None = None


class TMDBError(Exception):
    """Erreur mn TMDB, m3a status code li ghadi nrj3o l frontend."""

    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(message)


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(base_url=TMDB_BASE_URL, timeout=10.0)
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


def image_url(path: str | None, size: str = "w500") -> str | None:
    """TMDB kayrje3 ghir path (/abc.jpg). Hna kanrdouh URL kamla."""
    if not path:
        return None
    return f"{IMAGE_BASE_URL}/{size}{path}"


async def tmdb_get(path: str, params: dict | None = None, ttl: int = 600) -> Any:
    """GET l TMDB. ttl = ch7al mn seconde n7tafdo b réponse f cache."""
    params = {k: v for k, v in (params or {}).items() if v is not None}
    cache_key = path + "?" + "&".join(f"{k}={v}" for k, v in sorted(params.items()))

    cached = _cache.get(cache_key)
    if cached and cached[0] > time.monotonic():
        return cached[1]

    try:
        response = await get_client().get(
            path, params={"api_key": settings.tmdb_api_key, **params}
        )
    except httpx.TimeoutException:
        raise TMDBError(504, "TMDB took too long to respond")
    except httpx.RequestError:
        raise TMDBError(502, "Could not reach TMDB")

    if response.status_code == 404:
        raise TMDBError(404, "Not found")
    if response.status_code == 401:
        raise TMDBError(502, "TMDB API key is invalid")
    if response.status_code == 429:
        raise TMDBError(503, "Too many requests to TMDB, try again later")
    if response.status_code >= 400:
        raise TMDBError(502, f"TMDB error ({response.status_code})")

    data = response.json()

    if len(_cache) >= _CACHE_MAX_ITEMS:
        _cache.pop(next(iter(_cache)))  # n7yedo l-qdim
    _cache[cache_key] = (time.monotonic() + ttl, data)
    return data
