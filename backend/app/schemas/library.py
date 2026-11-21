"""Schemas dyal favorites w watchlist."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.services.tmdb import image_url


class AddMovie(BaseModel):
    """Frontend kaysifet ghir movie_id. Backend kayjib title w poster mn TMDB."""

    movie_id: int = Field(gt=0)


class WatchedUpdate(BaseModel):
    watched: bool


class _SavedMovie(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    movie_id: int
    title: str
    poster_path: str | None = Field(exclude=True)
    created_at: datetime

    @computed_field
    @property
    def poster_url(self) -> str | None:
        return image_url(self.poster_path, "w500")


class FavoriteOut(_SavedMovie):
    pass


class WatchlistItemOut(_SavedMovie):
    watched: bool


class LibraryStatus(BaseModel):
    """Wach film f favorites/watchlist dyal user (l page dyal détails)."""

    movie_id: int
    is_favorite: bool
    in_watchlist: bool
    watched: bool
