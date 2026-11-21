"""Favorites w watchlist dyal user m-connecti (kolchi ytleb token)."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db import get_db
from app.models import Favorite, User, WatchlistItem
from app.schemas import (
    AddMovie,
    FavoriteOut,
    LibraryStatus,
    WatchedUpdate,
    WatchlistItemOut,
)
from app.services.tmdb import tmdb_get

router = APIRouter()


async def fetch_movie_basics(movie_id: int) -> tuple[str, str | None]:
    """Kanjibo title w poster mn TMDB (404 ila film ma-kaynch).

    Nfs params dyal /movies/{id} bach nst3mlo nfs cache.
    """
    data = await tmdb_get(
        f"/movie/{movie_id}", {"append_to_response": "credits,videos"}, ttl=3600
    )
    return data.get("title") or data.get("original_title") or "", data.get("poster_path")


def _get_item(db: Session, model, user_id: int, movie_id: int):
    return db.scalar(
        select(model).where(model.user_id == user_id, model.movie_id == movie_id)
    )


def _save(db: Session, item, already_msg: str):
    db.add(item)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, already_msg)
    db.refresh(item)
    return item


# ---------------- Favorites ----------------


@router.get("/favorites", response_model=list[FavoriteOut], tags=["favorites"])
def list_favorites(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.scalars(
        select(Favorite)
        .where(Favorite.user_id == user.id)
        .order_by(Favorite.created_at.desc(), Favorite.id.desc())
    ).all()


@router.post(
    "/favorites",
    response_model=FavoriteOut,
    status_code=status.HTTP_201_CREATED,
    tags=["favorites"],
)
async def add_favorite(
    body: AddMovie,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _get_item(db, Favorite, user.id, body.movie_id):
        raise HTTPException(status.HTTP_409_CONFLICT, "Movie already in favorites")

    title, poster_path = await fetch_movie_basics(body.movie_id)
    item = Favorite(
        user_id=user.id, movie_id=body.movie_id, title=title, poster_path=poster_path
    )
    return _save(db, item, "Movie already in favorites")


@router.delete(
    "/favorites/{movie_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["favorites"],
)
def remove_favorite(
    movie_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = _get_item(db, Favorite, user.id, movie_id)
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movie not in favorites")
    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------------- Watchlist ----------------


@router.get("/watchlist", response_model=list[WatchlistItemOut], tags=["watchlist"])
def list_watchlist(
    watched: bool | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """?watched=true -> ghir li chfti, ?watched=false -> ghir li mazal."""
    query = select(WatchlistItem).where(WatchlistItem.user_id == user.id)
    if watched is not None:
        query = query.where(WatchlistItem.watched == watched)
    return db.scalars(
        query.order_by(WatchlistItem.created_at.desc(), WatchlistItem.id.desc())
    ).all()


@router.post(
    "/watchlist",
    response_model=WatchlistItemOut,
    status_code=status.HTTP_201_CREATED,
    tags=["watchlist"],
)
async def add_to_watchlist(
    body: AddMovie,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _get_item(db, WatchlistItem, user.id, body.movie_id):
        raise HTTPException(status.HTTP_409_CONFLICT, "Movie already in watchlist")

    title, poster_path = await fetch_movie_basics(body.movie_id)
    item = WatchlistItem(
        user_id=user.id, movie_id=body.movie_id, title=title, poster_path=poster_path
    )
    return _save(db, item, "Movie already in watchlist")


@router.patch(
    "/watchlist/{movie_id}", response_model=WatchlistItemOut, tags=["watchlist"]
)
def set_watched(
    movie_id: int,
    body: WatchedUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = _get_item(db, WatchlistItem, user.id, movie_id)
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movie not in watchlist")
    item.watched = body.watched
    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/watchlist/{movie_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["watchlist"],
)
def remove_from_watchlist(
    movie_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = _get_item(db, WatchlistItem, user.id, movie_id)
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Movie not in watchlist")
    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------------- Status (l page dyal détails) ----------------


@router.get("/library/{movie_id}", response_model=LibraryStatus, tags=["library"])
def library_status(
    movie_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = _get_item(db, Favorite, user.id, movie_id)
    wl = _get_item(db, WatchlistItem, user.id, movie_id)
    return LibraryStatus(
        movie_id=movie_id,
        is_favorite=fav is not None,
        in_watchlist=wl is not None,
        watched=bool(wl and wl.watched),
    )
