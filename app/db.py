from sqlalchemy import create_engine
from app.config import Config

engine = create_engine(
    Config.DATABASE_URL,
    pool_pre_ping=True
)