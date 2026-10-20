import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import engine
from app.rate_limit import limiter
from app.routers import admin, auth, challenges, communication, course, duels, games, onboarding, profile, rating, shop, translation

logging.basicConfig(level=logging.INFO)

LOCAL_NETWORK_ORIGIN_REGEX = (
    r"^https?://(?:localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|"
    r"192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2[0-9]|3[01])(?:\.\d{1,3}){2}):5500$"
)

app = FastAPI(title="Lingolion API", version="1.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=LOCAL_NETWORK_ORIGIN_REGEX if settings.ENVIRONMENT == "development" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logging.getLogger("lingolion").exception("Unhandled exception")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(onboarding.router)
app.include_router(course.router)
app.include_router(communication.router)
app.include_router(rating.router)
app.include_router(games.router)
app.include_router(duels.router)
app.include_router(challenges.router)
app.include_router(profile.router)
app.include_router(shop.router)
app.include_router(translation.router)



@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Lingolion API"}


@app.get("/api/ready")
def readiness_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        logging.getLogger("lingolion").exception("Database readiness check failed")
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"status": "ok", "service": "Lingolion API", "database": "ok"}


frontend_directory = Path(__file__).resolve().parents[2] / "frontend"


@app.get("/", include_in_schema=False)
def frontend_index():
    return FileResponse(frontend_directory / "index.html")


@app.get("/manifest.webmanifest", include_in_schema=False)
def frontend_manifest():
    return FileResponse(frontend_directory / "manifest.webmanifest")


@app.get("/sw.js", include_in_schema=False)
def frontend_service_worker():
    return FileResponse(frontend_directory / "sw.js", media_type="application/javascript")


for static_directory in ("css", "icons", "js", "locales"):
    app.mount(
        f"/{static_directory}",
        StaticFiles(directory=frontend_directory / static_directory),
        name=f"frontend-{static_directory}",
    )