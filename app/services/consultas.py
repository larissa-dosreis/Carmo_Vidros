from app.db import engine
from sqlalchemy import text

def buscar_produtos():
    with engine.connect() as conn:
        result = conn.execute(text('SELECT DISTINCT "Nome_produto" FROM produtos'))
        return [row[0] for row in result]