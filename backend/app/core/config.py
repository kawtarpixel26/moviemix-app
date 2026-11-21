from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    tmdb_api_key: str = ""

    # Auth (JWT)
    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 sa3a

    # "Continue with Google": Client ID mn Google Cloud Console
    # (ila khawi, /auth/google kayrdd 503)
    google_client_id: str = ""

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
