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

    # Senha do admin — para autenticação simples via .env
    # Quando migrar para banco, alterar a função check_auth em admin_routes.py
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")