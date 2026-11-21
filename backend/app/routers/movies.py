from typing import Literal

from fastapi import APIRouter, Query

from app.schemas import Genre, MovieDetail, MovieList
from app.services.tmdb import tmdb_get

router = APIRouter(prefix="/movies", tags=["movies"])

# TMDB ma kay3tich akthar mn page 500
PageParam = Query(1, ge=1, le=500, description="Num dyal page")


@router.get("/trending", response_model=MovieList)
async def trending(
    time_window: Literal["day", "week"] = "week", page: int = PageParam
):
    data = await tmdb_get(f"/trending/movie/{time_window}", {"page": page})
    return MovieList.from_tmdb(data)


@router.get("/popular", response_model=MovieList)
async def popular(page: int = PageParam):
    data = await tmdb_get("/movie/popular", {"page": page})
    return MovieList.from_tmdb(data)


@router.get("/top-rated", response_model=MovieList)
async def top_rated(page: int = PageParam):
    data = await tmdb_get("/movie/top_rated", {"page": page})
    return MovieList.from_tmdb(data)


@router.get("/upcoming", response_model=MovieList)
async def upcoming(page: int = PageParam):
    data = await tmdb_get("/movie/upcoming", {"page": page})
    return MovieList.from_tmdb(data)


@router.get("/search", response_model=MovieList)
async def search(
    query: str = Query(..., min_length=1, max_length=100),
    page: int = PageParam,
):
    data = await tmdb_get(
        "/search/movie",
        {"query": query.strip(), "page": page, "include_adult": "false"},
        ttl=300,
    )
    return MovieList.from_tmdb(data)


@router.get("/genres", response_model=list[Genre])
async def genres():
    data = await tmdb_get("/genre/movie/list", ttl=86400)
    return [Genre(**g) for g in data.get("genres", [])]


@router.get("/{movie_id}", response_model=MovieDetail)
async def movie_detail(movie_id: int):
    data = await tmdb_get(
        f"/movie/{movie_id}", {"append_to_response": "credits,videos"}, ttl=3600
    )
    return MovieDetail.from_tmdb(data)
