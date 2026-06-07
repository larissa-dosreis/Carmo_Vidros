from flask import Blueprint, render_template
from flask import jsonify

from app.services.consultas import buscar_produtos
from app.db import get_session
from app.models import Produto

site_bp = Blueprint("site", __name__)

@site_bp.route("/")
def home():
    return render_template("index.html")

@site_bp.route("/produtos")
def produtos():
    return render_template("produtos.html")

@site_bp.route("/orcamento")
def orcamento():
    return render_template("orcamento.html")


@site_bp.route("/get_produtos")
def get_produtos():
    produtos = buscar_produtos()
    return jsonify(produtos)


@site_bp.route("/api/tipos_vidro")
def api_tipos_vidro():
    """
    Retorna todos os produtos ativos agrupados por tipo_produto.
    Usado pela calculadora de orçamento para popular os selects dinamicamente.
    """
    db_session = get_session()
    try:
        produtos = db_session.query(Produto).filter(
            Produto.ativo == True
        ).order_by(
            Produto.tipo_produto, Produto.Nome_produto
        ).all()

        # Agrupar por tipo_produto
        categorias = {}
        for p in produtos:
            tipo = p.tipo_produto
            if tipo not in categorias:
                categorias[tipo] = []
            categorias[tipo].append({
                'id': p.id,
                'nome': p.Nome_produto,
                'preco': p.preco_produto
            })

        resultado = []
        for tipo, prods in categorias.items():
            resultado.append({
                'tipo': tipo,
                'produtos': prods
            })

        return jsonify(resultado)
    finally:
        db_session.close()