from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import check_password_hash
from app.config import Config
from app.db import get_session
from app.models import Produto, SubProduto, Administrador,ClienteLead
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
    """Processa login do admin buscando no banco de dados."""
    data = request.get_json()
    
    # O frontend JS continua mandando 'username', nós só lemos e comparamos com id_adm
    username_input = data.get('username', '') 
    password_input = data.get('password', '')

    if not username_input or not password_input:
        return jsonify({'success': False, 'message': 'Preencha ID e senha'}), 400

    db_session = get_session()
    
    try:
        # Busca o usuário no banco
        admin_user = db_session.query(Administrador).filter_by(id_adm=username_input).first()

        # Verifica se achou e se a senha criptografada confere
        if admin_user and check_password_hash(admin_user.senha_adm, password_input):
            session['admin_logado'] = True
            session['admin_user'] = admin_user.id_adm
            return jsonify({'success': True, 'message': 'Login realizado com sucesso'})
        
        # Se errou usuário ou senha
        return jsonify({'success': False, 'message': 'Usuário ou senha incorretos'}), 401

    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro no banco: {str(e)}'}), 500
    finally:
        db_session.close()


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

    db_session = get_session()

    try:
        produtos = db_session.query(Produto).order_by(
            Produto.Nome_produto
        ).all()

        resultado = []

        for produto in produtos:

            subprodutos = db_session.query(SubProduto).filter(
                SubProduto.produto_id == produto.id
            ).all()

            resultado.append({
                "id": produto.id,
                "Nome_produto": produto.Nome_produto,
                "ativo": produto.ativo,
                "subprodutos": [
                    sp.to_dict()
                    for sp in subprodutos
                ]
            })

        return jsonify(resultado)

    finally:
        db_session.close()


@admin_bp.route("/api/produto", methods=["POST"])
@login_required
def adicionar_produto():

    data = request.get_json()

    nome = data.get('Nome_produto', '').strip()

    if not nome:
        return jsonify({
            'error': 'Nome obrigatório'
        }), 400

    db_session = get_session()

    try:

        novo_produto = Produto(
            Nome_produto=nome,
            ativo=True
        )

        db_session.add(novo_produto)
        db_session.commit()

        return jsonify({
            'success': True
        })

    finally:
        db_session.close()


@admin_bp.route("/api/produto/<int:produto_id>", methods=["PUT"])
@login_required
def atualizar_produto(produto_id):

    data = request.get_json()

    db_session = get_session()

    try:
        produto = db_session.query(Produto).filter_by(
            id=produto_id
        ).first()

        if not produto:
            return jsonify({
                'error': 'Produto não encontrado'
            }), 404

        if 'Nome_produto' in data:
            produto.Nome_produto = data['Nome_produto'].strip()

        db_session.commit()

        return jsonify({
            'success': True,
            'message': 'Produto atualizado com sucesso',
            'produto': produto.to_dict()
        })

    except Exception as e:
        db_session.rollback()
        return jsonify({
            'error': f'Erro ao atualizar: {str(e)}'
        }), 500

    finally:
        db_session.close()

@admin_bp.route("/api/produto/<int:produto_id>", methods=["DELETE"])
@login_required
def remover_produto(produto_id):
    """Remove uma categoria (Produto) e todos os seus subprodutos vinculados."""
    db_session = get_session()
    try:
        produto = db_session.query(Produto).filter_by(id=produto_id).first()
        
        if not produto:
            return jsonify({'error': 'Categoria não encontrada'}), 404

        nome = produto.Nome_produto
        
        # 1. Primeiro deletamos os subprodutos para não dar erro de ForeignKey
        db_session.query(SubProduto).filter_by(produto_id=produto_id).delete()
        
        # 2. Agora deletamos a categoria em si
        db_session.delete(produto)
        db_session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Categoria "{nome}" e seus itens foram removidos'
        })
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': f'Erro ao remover: {str(e)}'}), 500
    finally:
        db_session.close()

@admin_bp.route("/api/produto/<int:produto_id>/toggle", methods=["POST"])
@login_required
def toggle_produto(produto_id):
    """Ativa ou desativa uma categoria e todas as suas subcategorias juntas."""
    db_session = get_session()
    try:
        produto = db_session.query(Produto).filter_by(id=produto_id).first()
        if not produto:
            return jsonify({'error': 'Categoria não encontrada'}), 404
        
        # Inverte o status da categoria pai
        novo_status = not produto.ativo
        produto.ativo = novo_status
        
        # BUSCA E ATUALIZA TODAS AS SUBCATEGORIAS DESTA CATEGORIA
        db_session.query(SubProduto).filter_by(produto_id=produto_id).update({"ativo": novo_status})
        
        db_session.commit()
        txt_status = "ativados" if novo_status else "desativados"
        return jsonify({
            'success': True, 
            'message': f'A categoria e todos os seus itens foram {txt_status} com sucesso!'
        })
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': f'Erro ao alterar status: {str(e)}'}), 500
    finally:
        db_session.close()

# ══════════════════════════════
#  API — CRUD DE SUBPRODUTOS
# ══════════════════════════════

@admin_bp.route("/api/subproduto", methods=["POST"])
@login_required
def adicionar_subproduto():
    data = request.get_json()
    db_session = get_session()
    try:
        novo_sub = SubProduto(
            produto_id=data['produto_id'],
            nome_subproduto=data['nome_subproduto'],
            preco=data['preco']
        )
        db_session.add(novo_sub)
        db_session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db_session.close()


@admin_bp.route("/api/subproduto/<int:sub_id>", methods=["PUT"])
@login_required
def atualizar_preco_subproduto(sub_id):
    data = request.get_json()
    db_session = get_session()
    try:
        sub = db_session.query(SubProduto).filter_by(id=sub_id).first()
        if not sub:
            return jsonify({'error': 'Subproduto não encontrado'}), 404
            
        if 'preco' in data:
            sub.preco = data['preco']
            
        db_session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db_session.close()


@admin_bp.route("/api/subproduto/<int:sub_id>", methods=["DELETE"])
@login_required
def remover_subproduto(sub_id):
    db_session = get_session()
    try:
        sub = db_session.query(SubProduto).filter_by(id=sub_id).first()
        if not sub:
            return jsonify({'error': 'Subproduto não encontrado'}), 404
            
        db_session.delete(sub)
        db_session.commit()
        return jsonify({'success': True, 'message': 'Item removido com sucesso'})
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db_session.close()

@admin_bp.route("/api/subproduto/<int:sub_id>/toggle", methods=["POST"])
@login_required
def toggle_subproduto(sub_id):
    """Ativa ou desativa um subproduto específico."""
    db_session = get_session()
    try:
        sub = db_session.query(SubProduto).filter_by(id=sub_id).first()
        
        if not sub:
            return jsonify({'error': 'Subproduto não encontrado'}), 404

        # Inverte o estado atual
        sub.ativo = not (sub.ativo if sub.ativo is not None else True)
        db_session.commit()
        
        status = "ativado" if sub.ativo else "desativado"
        return jsonify({
            'success': True,
            'message': f'Item "{sub.nome_subproduto}" {status}',
            'ativo': sub.ativo
        })
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': f'Erro ao alterar status: {str(e)}'}), 500
    finally:
        db_session.close()




@admin_bp.route("/api/leads", methods=["GET"])
@login_required
def listar_leads():
    db_session = get_session()
    try:
        # Fazemos um JOIN para cruzar o lead com o subproduto e o produto pai
        query = db_session.query(
            ClienteLead, SubProduto, Produto
        ).join(
            SubProduto, ClienteLead.FK_subproduto == SubProduto.id
        ).join(
            Produto, SubProduto.produto_id == Produto.id
        ).order_by(
            ClienteLead.created_at.desc() # Ordena do mais recente para o mais antigo
        ).all()

        resultado = []
        for lead, sub, prod in query:
            resultado.append({
                "id": lead.id,
                "data": lead.created_at.strftime("%d/%m/%Y %H:%M") if lead.created_at else "N/A",
                "nome": lead.nome_usuario,
                "telefone": lead.telefone,
                # Junta o nome do Produto com o Subproduto (Ex: Vidro Temperado - Janela 4 folhas)
                "interesse": f"{prod.Nome_produto} - {sub.nome_subproduto}"
            })

        return jsonify(resultado)

    except Exception as e:
        return jsonify({'error': f'Erro ao buscar leads: {str(e)}'}), 500
    finally:
        db_session.close()