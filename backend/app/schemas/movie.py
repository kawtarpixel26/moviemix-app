"""Chkel dyal data dyal films li katrje3 l frontend (ghir l-fields li m7tajin)."""

from pydantic import BaseModel

from app.services.tmdb import image_url


class Genre(BaseModel):
    id: int
    name: str


class MovieSummary(BaseModel):
    """Film f liste (cards)."""

    id: int
    title: str
    overview: str
    poster_url: str | None
    backdrop_url: str | None
    release_date: str | None
    vote_average: float
    vote_count: int
    genre_ids: list[int]

    @classmethod
    def from_tmdb(cls, m: dict) -> "MovieSummary":
        return cls(
            id=m["id"],
            title=m.get("title") or m.get("original_title") or "",
            overview=m.get("overview") or "",
            poster_url=image_url(m.get("poster_path"), "w500"),
            backdrop_url=image_url(m.get("backdrop_path"), "w1280"),
            release_date=m.get("release_date") or None,
            vote_average=m.get("vote_average") or 0.0,
            vote_count=m.get("vote_count") or 0,
            genre_ids=m.get("genre_ids") or [],
        )


class MovieList(BaseModel):
    page: int
    total_pages: int
    total_results: int
    results: list[MovieSummary]

    @classmethod
    def from_tmdb(cls, data: dict) -> "MovieList":
        return cls(
            page=data.get("page", 1),
            # TMDB ma kay3tich akthar mn page 500
            total_pages=min(data.get("total_pages", 0), 500),
            total_results=data.get("total_results", 0),
            results=[MovieSummary.from_tmdb(m) for m in data.get("results", [])],
        )


class CastMember(BaseModel):
    id: int
    name: str
    character: str
    profile_url: str | None


class MovieDetail(BaseModel):
    """Détails kamlin dyal film we7d."""

    id: int
    title: str
    original_title: str
    tagline: str | None
    overview: str
    poster_url: str | None
    backdrop_url: str | None
    release_date: str | None
    runtime: int | None  # b d9aye9
    status: str | None
    original_language: str | None
    vote_average: float
    vote_count: int
    genres: list[Genre]
    cast: list[CastMember]
    trailer_url: str | None
    imdb_id: str | None

    @classmethod
    def from_tmdb(cls, m: dict) -> "MovieDetail":
        cast = [
            CastMember(
                id=c["id"],
                name=c.get("name") or "",
                character=c.get("character") or "",
                profile_url=image_url(c.get("profile_path"), "w185"),
            )
            for c in (m.get("credits") or {}).get("cast", [])[:15]
        ]

        return cls(
            id=m["id"],
            title=m.get("title") or "",
            original_title=m.get("original_title") or "",
            tagline=m.get("tagline") or None,
            overview=m.get("overview") or "",
            poster_url=image_url(m.get("poster_path"), "w500"),
            backdrop_url=image_url(m.get("backdrop_path"), "original"),
            release_date=m.get("release_date") or None,
            runtime=m.get("runtime") or None,
            status=m.get("status") or None,
            original_language=m.get("original_language") or None,
            vote_average=m.get("vote_average") or 0.0,
            vote_count=m.get("vote_count") or 0,
            genres=[Genre(**g) for g in m.get("genres", [])],
            cast=cast,
            trailer_url=_pick_trailer((m.get("videos") or {}).get("results", [])),
            imdb_id=m.get("imdb_id") or None,
        )


def _pick_trailer(videos: list[dict]) -> str | None:
    """Kankhtarou trailer YouTube (l-official 9bel)."""
    youtube = [v for v in videos if v.get("site") == "YouTube" and v.get("key")]
    for want_official in (True, False):
        for v in youtube:
            if v.get("type") == "Trailer" and bool(v.get("official")) == want_official:
                return f"https://www.youtube.com/watch?v={v['key']}"
    return None
