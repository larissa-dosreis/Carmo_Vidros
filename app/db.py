from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.config import Config

engine = create_engine(
    Config.DATABASE_URL,
    pool_pre_ping=True
)

Session = sessionmaker(bind=engine)


def get_session():
    """Retorna uma nova sessão do SQLAlchemy."""
    return Session()


def ensure_ativo_column():
    """
    Garante que a coluna 'ativo' exista na tabela produtos.
    Usa ALTER TABLE ... ADD COLUMN IF NOT EXISTS (PostgreSQL).
    """
    try:
        with engine.connect() as conn:
            conn.execute(text(
                'ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE'
            ))
            conn.commit()
    except Exception as e:
        print(f"[INFO] Coluna 'ativo' já existe ou erro: {e}")