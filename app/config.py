import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")

    DATABASE_URL = (
        f"postgresql+psycopg2://{os.getenv('SUPABASE_USER')}:"
        f"{os.getenv('SUPABASE_PASSWORD')}@"
        f"{os.getenv('SUPABASE_HOST')}:"
        f"{os.getenv('SUPABASE_PORT')}/"
        f"{os.getenv('SUPABASE_DB')}?sslmode=require"
    )