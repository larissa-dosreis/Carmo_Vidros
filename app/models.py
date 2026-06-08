from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base
from datetime import datetime


Base = declarative_base()


class Produto(Base):
    __tablename__ = 'produtos'

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    Nome_produto = Column(String, nullable=False)
    ativo = Column(Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'Nome_produto': self.Nome_produto,
            'ativo': self.ativo
        }


class SubProduto(Base):
    __tablename__ = 'sub_produtos'

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    produto_id = Column(
        Integer,
        ForeignKey('produtos.id'),
        nullable=False
    )

    nome_subproduto = Column(String, nullable=False)
    preco = Column(Float, nullable=False)
    ativo = Column(Boolean, default=True) # NOVO CAMPO AQUI

    def to_dict(self):
        return {
            'id': self.id,
            'produto_id': self.produto_id,
            'nome_subproduto': self.nome_subproduto,
            'preco': self.preco,
            'ativo': self.ativo # NOVO CAMPO AQUI
        }




# ... (mantenha os imports e as classes Produto e SubProduto intactas)

class Administrador(Base):
    __tablename__ = 'administrador'

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    nome_adm = Column(String)
    email_adm = Column(String)
    id_adm = Column(String, unique=True, nullable=False)
    senha_adm = Column(String, nullable=False)



class ClienteLead(Base):
    __tablename__ = 'usuario' 
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Use exatamente os nomes da sua imagem (minúsculos e sem aspas extras)
    nome_usuario = Column(String, nullable=False)
    telefone = Column(Integer, nullable=False)
    FK_subproduto = Column(Integer, nullable=False)