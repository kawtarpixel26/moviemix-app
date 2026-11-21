from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models  # noqa: F401  (bach les tables ytsjjlo)
from app.db import Base, engine, get_db
from app.routers import auth, library, movies
from app.services.tmdb import TMDBError, close_client

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_client()  # nsddo connexion m3a TMDB mlli serveur y7bes


app = FastAPI(title="Movie App API", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(library.router)


@app.exception_handler(TMDBError)
async def tmdb_error_handler(request: Request, exc: TMDBError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.get("/")
def root():
    return {"message": "Movie App API", "docs": "/docs"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
