from urllib.parse import urlparse, urlunparse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# Clean DATABASE_URL: remove query params unsupported by psycopg2 (e.g. ?pgbouncer=true)
parsed = urlparse(settings.DATABASE_URL)
clean_url = urlunparse(parsed._replace(query=""))
engine = create_engine(clean_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
