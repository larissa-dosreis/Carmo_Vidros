from flask import Blueprint, render_template, jsonify
from app.services.consultas import buscar_produtos
from app.db import get_session
from app.models import Produto, SubProduto # <-- ADICIONE O SUBPRODUTO AQUI

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
    db_session = get_session()

    try:
        # 1. Busca todas as categorias (Produtos) ativas no banco
        categorias_ativas = db_session.query(Produto).filter(
            Produto.ativo == True
        ).order_by(
            Produto.Nome_produto
        ).all()

        resultado = []

        for categoria in categorias_ativas:
            # 2. Para cada categoria, busca apenas os subprodutos que estão ATIVOS
            subs_ativos = db_session.query(SubProduto).filter(
                SubProduto.produto_id == categoria.id,
                SubProduto.ativo == True
            ).order_by(
                SubProduto.nome_subproduto
            ).all()

            # 3. Só adiciona a categoria na resposta final se ela tiver pelo menos 1 subproduto ativo
            if subs_ativos:
                lista_produtos = []
                for sub in subs_ativos:
                    lista_produtos.append({
                        'id': sub.id,
                        'nome': sub.nome_subproduto,
                        'preco': sub.preco
                    })

                resultado.append({
                    'id_categoria': categoria.id,
                    'tipo': categoria.Nome_produto, # Nome da Categoria (ex: Vidro Temperado)
                    'produtos': lista_produtos      # Lista dos subprodutos dela
                })

        return jsonify(resultado)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        db_session.close()