from flask import Blueprint, render_template
from flask import jsonify

from app.services.consultas import buscar_produtos

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