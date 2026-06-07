from flask import Flask
from app.config import Config

def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    # Garantir coluna 'ativo' na tabela produtos
    from app.db import ensure_ativo_column
    ensure_ativo_column()

    from app.routes.routes import site_bp
    app.register_blueprint(site_bp)

    from app.routes.admin_routes import admin_bp
    app.register_blueprint(admin_bp)

    return app