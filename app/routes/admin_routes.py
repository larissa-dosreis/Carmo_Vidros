from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from app.config import Config
from app.db import get_session
from app.models import Produto
from functools import wraps

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


# ══════════════════════════════
#  AUTENTICAÇÃO
# ══════════════════════════════

def login_required(f):
    """Decorator que exige login para acessar rotas do admin."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logado'):
            if request.is_json or request.path.startswith('/admin/api'):
                return jsonify({'error': 'Não autorizado'}), 401
            return redirect(url_for('admin.login_page'))
        return f(*args, **kwargs)
    return decorated_function


def check_auth(username, password):
    """
    Verifica credenciais do admin.
    ATUAL: compara com variáveis do .env (Config).
    FUTURO: alterar para consultar tabela 'usuarios_admin' no banco.
    
    Para migrar para banco, substituir o conteúdo desta função por:
        from app.models import Usuario
        db_session = get_session()
        user = db_session.query(Usuario).filter_by(username=username, ativo=True).first()
        db_session.close()
        return user and user.senha_hash == hash_password(password)
    """
    return (
        username == Config.ADMIN_USERNAME and
        password == Config.ADMIN_PASSWORD
    )


# ══════════════════════════════
#  PÁGINAS
# ══════════════════════════════

@admin_bp.route("/")
def login_page():
    """Página de login do admin."""
    if session.get('admin_logado'):
        return redirect(url_for('admin.dashboard'))
    return render_template("admin.html", page="login")


@admin_bp.route("/dashboard")
@login_required
def dashboard():
    """Dashboard do painel admin."""
    return render_template("admin.html", page="dashboard")


# ══════════════════════════════
#  AUTH API
# ══════════════════════════════

@admin_bp.route("/login", methods=["POST"])
def login():
    """Processa login do admin."""
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')

    if check_auth(username, password):
        session['admin_logado'] = True
        session['admin_user'] = username
        return jsonify({'success': True, 'message': 'Login realizado com sucesso'})
    
    return jsonify({'success': False, 'message': 'Usuário ou senha incorretos'}), 401


@admin_bp.route("/logout", methods=["POST"])
def logout():
    """Encerra sessão do admin."""
    session.pop('admin_logado', None)
    session.pop('admin_user', None)
    return jsonify({'success': True, 'message': 'Logout realizado'})


# ══════════════════════════════
#  API — CRUD DE PRODUTOS
# ══════════════════════════════

@admin_bp.route("/api/produtos", methods=["GET"])
@login_required
def listar_produtos():
    """Retorna todos os produtos agrupados por tipo."""
    db_session = get_session()
    try:
        produtos = db_session.query(Produto).order_by(
            Produto.tipo_produto, Produto.Nome_produto
        ).all()
        
        resultado = [p.to_dict() for p in produtos]
        return jsonify(resultado)
    finally:
        db_session.close()


@admin_bp.route("/api/produto", methods=["POST"])
@login_required
def adicionar_produto():
    """Adiciona novo tipo de material."""
    data = request.get_json()
    
    nome = data.get('Nome_produto', '').strip()
    tipo = data.get('tipo_produto', '').strip()
    preco = data.get('preco_produto')

    if not nome or not tipo or preco is None:
        return jsonify({'error': 'Todos os campos são obrigatórios'}), 400

    try:
        preco = float(preco)
    except (ValueError, TypeError):
        return jsonify({'error': 'Preço inválido'}), 400

    db_session = get_session()
    try:
        novo_produto = Produto(
            Nome_produto=nome,
            tipo_produto=tipo,
            preco_produto=preco,
            ativo=True
        )
        db_session.add(novo_produto)
        db_session.commit()
        db_session.refresh(novo_produto)
        
        return jsonify({
            'success': True,
            'message': 'Produto adicionado com sucesso',
            'produto': novo_produto.to_dict()
        }), 201
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': f'Erro ao adicionar: {str(e)}'}), 500
    finally:
        db_session.close()


@admin_bp.route("/api/produto/<int:produto_id>", methods=["PUT"])
@login_required
def atualizar_produto(produto_id):
    """Atualiza preço ou dados de um produto."""
    data = request.get_json()
    
    db_session = get_session()
    try:
        produto = db_session.query(Produto).filter_by(id=produto_id).first()
        
        if not produto:
            return jsonify({'error': 'Produto não encontrado'}), 404

        if 'preco_produto' in data:
            try:
                produto.preco_produto = float(data['preco_produto'])
            except (ValueError, TypeError):
                return jsonify({'error': 'Preço inválido'}), 400

        if 'Nome_produto' in data:
            produto.Nome_produto = data['Nome_produto'].strip()

        if 'tipo_produto' in data:
            produto.tipo_produto = data['tipo_produto'].strip()

        db_session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Produto atualizado com sucesso',
            'produto': produto.to_dict()
        })
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': f'Erro ao atualizar: {str(e)}'}), 500
    finally:
        db_session.close()


@admin_bp.route("/api/produto/<int:produto_id>", methods=["DELETE"])
@login_required
def remover_produto(produto_id):
    """Remove um tipo de material."""
    db_session = get_session()
    try:
        produto = db_session.query(Produto).filter_by(id=produto_id).first()
        
        if not produto:
            return jsonify({'error': 'Produto não encontrado'}), 404

        nome = produto.Nome_produto
        db_session.delete(produto)
        db_session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Produto "{nome}" removido com sucesso'
        })
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': f'Erro ao remover: {str(e)}'}), 500
    finally:
        db_session.close()


@admin_bp.route("/api/produto/<int:produto_id>/toggle", methods=["POST"])
@login_required
def toggle_produto(produto_id):
    """Ativa ou desativa um produto (controle de estoque)."""
    db_session = get_session()
    try:
        produto = db_session.query(Produto).filter_by(id=produto_id).first()
        
        if not produto:
            return jsonify({'error': 'Produto não encontrado'}), 404

        # Inverte o estado ativo
        produto.ativo = not (produto.ativo if produto.ativo is not None else True)
        db_session.commit()
        
        status = "ativado" if produto.ativo else "desativado"
        return jsonify({
            'success': True,
            'message': f'Produto "{produto.Nome_produto}" {status}',
            'ativo': produto.ativo
        })
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': f'Erro ao alterar status: {str(e)}'}), 500
    finally:
        db_session.close()
