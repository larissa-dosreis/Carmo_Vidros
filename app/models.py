from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()


class Produto(Base):
    """
    Modelo que mapeia a tabela 'produtos' já existente no Supabase.
    Colunas: id, created_at, Nome_produto, preco_produto, tipo_produto, id_produto, ativo
    """
    __tablename__ = 'produtos'

    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    Nome_produto = Column(String, nullable=False)
    preco_produto = Column(Float, nullable=False)
    tipo_produto = Column(String, nullable=False)
    id_produto = Column(Integer)
    ativo = Column(Boolean, default=True, server_default='true')

    def to_dict(self):
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'Nome_produto': self.Nome_produto,
            'preco_produto': self.preco_produto,
            'tipo_produto': self.tipo_produto,
            'id_produto': self.id_produto,
            'ativo': self.ativo if self.ativo is not None else True
        }


class Usuario(Base):
    """
    Modelo para autenticação de usuários admin.
    Preparado para migração futura — por enquanto usa senha fixa do .env.
    Quando migrar para banco, basta criar esta tabela e alterar a função de autenticação.
    """
    __tablename__ = 'usuarios_admin'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
