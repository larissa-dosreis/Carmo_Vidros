/* ═══════════════════════════════════════════════
   Carmo Vidros — Admin Panel JavaScript (Atualizado)
   ═══════════════════════════════════════════════ */

let produtos = [];
let deleteCallback = null;

// ══════════════════════════════
//  TOAST NOTIFICATIONS & LOGIN
// ══════════════════════════════
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success'
        ? '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        const btn = document.getElementById('loginBtn');

        if (!username || !password) return showToast('Preencha todos os campos', 'error');

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px"></span> Entrando...';

        try {
            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.success) {
                window.location.href = '/admin/dashboard';
            } else {
                errorEl.textContent = data.message || 'Credenciais inválidas';
                errorEl.classList.add('show');
            }
        } catch (err) {
            errorEl.textContent = 'Erro de conexão. Tente novamente.';
            errorEl.classList.add('show');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Entrar';
        }
    });
}

async function logout() {
    try {
        await fetch('/admin/logout', { method: 'POST' });
        window.location.href = '/admin/';
    } catch (err) {
        window.location.href = '/admin/';
    }
}

// ══════════════════════════════
//  TABS E LOAD DATA
// ══════════════════════════════
function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.admin-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = document.getElementById(`panel-${target}`);
            if (panel) panel.classList.add('active');
        });
    });
}

async function loadProdutos() {
    try {
        const response = await fetch('/admin/api/produtos');
        if (response.status === 401) return window.location.href = '/admin/';
        
        produtos = await response.json();
        
        renderPrecos();
        renderEstoque();
        renderStats();
        populateTipoSelect();
        renderMaterialsTable();
    } catch (err) {
        showToast('Erro ao carregar dados', 'error');
    }
}

// ══════════════════════════════
//  STATS
// ══════════════════════════════
function renderStats() {
    let totalItems = 0;
    let ativos = 0;
    
    produtos.forEach(p => {
        const qty = p.subprodutos ? p.subprodutos.length : 0;
        totalItems += qty;
        if (p.ativo) ativos += qty;
    });

    const categorias = produtos.length;
    const inativos = totalItems - ativos;

    const el = (id) => document.getElementById(id);
    if (el('statTotal')) el('statTotal').textContent = totalItems;
    if (el('statAtivos')) el('statAtivos').textContent = ativos;
    if (el('statInativos')) el('statInativos').textContent = inativos;
    if (el('statCategorias')) el('statCategorias').textContent = categorias;

    const badge = document.getElementById('stockBadge');
    if (badge) {
        badge.textContent = inativos;
        badge.style.display = inativos > 0 ? 'inline' : 'none';
    }
}

// ══════════════════════════════
//  PREÇOS TAB (AGORA LÊ SUBPRODUTOS)
// ══════════════════════════════
// ══════════════════════════════
//  PREÇOS TAB (AGORA LÊ O STATUS DO SUBPRODUTO)
// ══════════════════════════════
function renderPrecos(filter = '') {
    const tbody = document.getElementById('precosTableBody');
    if (!tbody) return;

    let html = '';
    let foundAny = false;

    produtos.forEach(produto => {
        const matchCategory = produto.Nome_produto.toLowerCase().includes(filter.toLowerCase());
        const subsFiltrados = produto.subprodutos.filter(sp => 
            sp.nome_subproduto.toLowerCase().includes(filter.toLowerCase())
        );

        if (filter && !matchCategory && subsFiltrados.length === 0) return;

        const subsToRender = (filter && !matchCategory) ? subsFiltrados : produto.subprodutos;

        if (subsToRender.length > 0 || matchCategory) {
            foundAny = true;
            html += `
                <tr class="category-row">
                    <td colspan="4">
                        <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                        ${produto.Nome_produto}
                    </td>
                </tr>`;

            subsToRender.forEach(sp => {
                // Agora lemos sp.ativo em vez de produto.ativo
                const isAtivo = sp.ativo !== false; 
                const statusClass = isAtivo ? '' : 'style="opacity:0.5"';

                html += `
                    <tr id="row-${sp.id}" ${statusClass}>
                        <td style="padding-left:44px">${sp.nome_subproduto}</td>
                        <td>
                            <span class="price-display" id="price-display-${sp.id}">
                                R$ ${parseFloat(sp.preco).toFixed(2)}<small>/m²</small>
                            </span>
                            <input type="number" class="price-edit-input" id="price-input-${sp.id}"
                                   value="${sp.preco}" step="0.01" min="0" style="display:none" />
                        </td>
                        <td>
                            <span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:${isAtivo ? '#16a34a' : '#dc2626'}">
                                <span style="width:8px;height:8px;border-radius:50%;background:${isAtivo ? '#16a34a' : '#dc2626'}"></span>
                                ${isAtivo ? 'Ativo' : 'Pausado'}
                            </span>
                        </td>
                        <td>
                            <span id="actions-view-${sp.id}" style="display:inline-flex; gap:8px;">
                                <button class="btn-action btn-edit" onclick="editPrice(${sp.id}, ${sp.preco})">
                                    <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editar
                                </button>
                                <button class="btn-action" style="color: ${isAtivo ? '#dc2626' : '#16a34a'}; border-color: transparent;" onclick="toggleSubStock(${sp.id})">
                                    ${isAtivo ? 'Pausar' : 'Ativar'}
                                </button>
                            </span>
                            <span id="actions-edit-${sp.id}" style="display:none">
                                <button class="btn-action btn-save" onclick="savePrice(${sp.id})">Salvar</button>
                                <button class="btn-action btn-cancel" onclick="cancelEdit(${sp.id}, ${sp.preco})">Cancelar</button>
                            </span>
                        </td>
                    </tr>`;
            });
        }
    });

    if (!foundAny) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto encontrado</td></tr>`;
        return;
    }
    tbody.innerHTML = html;
}

// Nova função para ativar/desativar o SubProduto
async function toggleSubStock(id) {
    try {
        const response = await fetch(`/admin/api/subproduto/${id}/toggle`, { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            showToast(data.message);
            await loadProdutos(); // Recarrega os dados para atualizar a tabela visualmente
        } else {
            showToast(data.error || 'Erro ao alterar status', 'error');
        }
    } catch (err) {
        showToast('Erro de conexão', 'error');
    }
}

function editPrice(id, currentPrice) {
    document.getElementById(`price-display-${id}`).style.display = 'none';
    const input = document.getElementById(`price-input-${id}`);
    input.style.display = 'inline-block';
    input.value = currentPrice;
    document.getElementById(`actions-view-${id}`).style.display = 'none';
    document.getElementById(`actions-edit-${id}`).style.display = 'inline';
    input.focus();
}

function cancelEdit(id, originalPrice) {
    document.getElementById(`price-input-${id}`).value = originalPrice;
    document.getElementById(`price-display-${id}`).style.display = 'inline';
    document.getElementById(`price-input-${id}`).style.display = 'none';
    document.getElementById(`actions-view-${id}`).style.display = 'inline';
    document.getElementById(`actions-edit-${id}`).style.display = 'none';
}

async function savePrice(id) {
    const input = document.getElementById(`price-input-${id}`);
    const novoPreco = parseFloat(input.value);

    if (isNaN(novoPreco) || novoPreco < 0) return showToast('Preço inválido', 'error');

    try {
        const response = await fetch(`/admin/api/subproduto/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preco: novoPreco })
        });
        const data = await response.json();

        if (data.success) {
            showToast('Preço atualizado com sucesso');
            await loadProdutos();
        } else {
            showToast(data.error || 'Erro ao atualizar', 'error');
        }
    } catch (err) {
        showToast('Erro de conexão', 'error');
    }
}

// ══════════════════════════════
//  MATERIAIS TAB (CRIA CATEGORIA + ITEM)
// ══════════════════════════════
function populateTipoSelect() {
    const select = document.getElementById('materialTipo');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Selecione a Categoria...</option>';
    produtos.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.Nome_produto}</option>`;
    });
    select.innerHTML += '<option value="__novo__">+ Nova Categoria...</option>';
}

function initMaterialForm() {
    const select = document.getElementById('materialTipo');
    if (!select) return;

    select.addEventListener('change', function() {
        const novoInput = document.getElementById('materialTipoNovo');
        if (this.value === '__novo__') {
            novoInput.style.display = 'block';
            novoInput.focus();
        } else {
            novoInput.style.display = 'none';
            novoInput.value = '';
        }
    });
}

async function adicionarMaterial() {
    const selectTipo = document.getElementById('materialTipo');
    const inputTipoNovo = document.getElementById('materialTipoNovo');
    const inputNome = document.getElementById('materialNome');
    const inputPreco = document.getElementById('materialPreco');

    let produtoId = selectTipo.value;
    const isNovoProduto = (produtoId === '__novo__');
    const nomeCategoriaNova = inputTipoNovo.value.trim();
    const nomeSubProduto = inputNome.value.trim();
    const preco = parseFloat(inputPreco.value);

    if (!nomeSubProduto || isNaN(preco) || preco <= 0 || (isNovoProduto && !nomeCategoriaNova)) {
        return showToast('Preencha todos os campos corretamente', 'error');
    }

    try {
        // 1. Se for nova categoria, cria a Categoria (Produto) primeiro
        if (isNovoProduto) {
            const resProd = await fetch('/admin/api/produto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Nome_produto: nomeCategoriaNova })
            });
            const dataProd = await resProd.json();
            if (!dataProd.success) throw new Error(dataProd.error);
            
            // Recarrega para obter o ID recém-criado
            await loadProdutos(); 
            const novaCategoria = produtos.find(p => p.Nome_produto.toLowerCase() === nomeCategoriaNova.toLowerCase());
            produtoId = novaCategoria.id;
        }

        // 2. Cria o Item (SubProduto)
        const response = await fetch('/admin/api/subproduto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                produto_id: produtoId,
                nome_subproduto: nomeSubProduto,
                preco: preco
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Item adicionado com sucesso');
            inputNome.value = '';
            inputPreco.value = '';
            inputTipoNovo.value = '';
            inputTipoNovo.style.display = 'none';
            selectTipo.selectedIndex = 0;
            await loadProdutos();
        } else {
            showToast(data.error || 'Erro ao adicionar item', 'error');
        }
    } catch (err) {
        showToast('Erro de conexão ao adicionar material', 'error');
    }
}

// ══════════════════════════════
//  REMOVER SUBPRODUTO
// ══════════════════════════════
function renderMaterialsTable() {
    const tbody = document.getElementById('materiaisTableBody');
    if (!tbody) return;

    let html = '';
    produtos.forEach(produto => {
        if (!produto.subprodutos || produto.subprodutos.length === 0) return;

        html += `
            <tr class="category-row">
                <td colspan="4">
                    <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    ${produto.Nome_produto}
                </td>
            </tr>`;

        produto.subprodutos.forEach(sp => {
            html += `
                <tr>
                    <td style="padding-left:44px">${sp.nome_subproduto}</td>
                    <td>R$ ${parseFloat(sp.preco).toFixed(2)}/m²</td>
                    <td>
                        <span style="color:${produto.ativo ? '#16a34a' : '#dc2626'};font-size:12px;font-weight:600">
                            ${produto.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        <button class="btn-action btn-delete" onclick="confirmDelete(${sp.id}, '${sp.nome_subproduto.replace(/'/g, "\\'")}')">
                            Remover
                        </button>
                    </td>
                </tr>`;
        });
    });

    tbody.innerHTML = html;
}

function confirmDelete(id, nome) {
    const overlay = document.getElementById('confirmOverlay');
    document.getElementById('confirmText').textContent = `Deseja remover o item "${nome}"?`;
    overlay.classList.add('show');

    deleteCallback = async function() {
        try {
            const response = await fetch(`/admin/api/subproduto/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                showToast('Item removido com sucesso');
                await loadProdutos();
            } else {
                showToast(data.error || 'Erro ao remover', 'error');
            }
        } catch (err) {
            showToast('Erro de conexão', 'error');
        }
        closeConfirm();
    };
}

function executeDelete() { if (deleteCallback) deleteCallback(); }
function closeConfirm() {
    document.getElementById('confirmOverlay').classList.remove('show');
    deleteCallback = null;
}

// ══════════════════════════════
//  ESTOQUE TAB (POR CATEGORIA - PRODUTO)
// ══════════════════════════════
function renderEstoque(filter = '') {
    const container = document.getElementById('stockGrid');
    if (!container) return;

    const filtered = filter
        ? produtos.filter(p => p.Nome_produto.toLowerCase().includes(filter.toLowerCase()))
        : produtos;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <h3>Nenhuma categoria encontrada</h3>
            </div>`;
        return;
    }

    let html = '';
    filtered.forEach(p => {
        const ativo = p.ativo !== false;
        html += `
            <div class="stock-card ${ativo ? '' : 'inactive'}" id="stock-${p.id}">
                <div class="stock-info">
                    <div class="stock-tipo">Categoria Base</div>
                    <div class="stock-nome">${p.Nome_produto}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top:4px;">
                        ${p.subprodutos.length} itens vinculados
                    </div>
                    <div class="stock-status ${ativo ? 'ativo' : 'inativo'}">
                        ${ativo ? '● Disponível' : '● Pausada'}
                    </div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" ${ativo ? 'checked' : ''} onchange="toggleStock(${p.id})" />
                    <span class="toggle-slider"></span>
                </label>
            </div>`;
    });

    container.innerHTML = html;
}

async function toggleStock(id) {
    try {
        const response = await fetch(`/admin/api/produto/${id}/toggle`, { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            showToast(data.message);
            const produto = produtos.find(p => p.id === id);
            if (produto) produto.ativo = data.ativo;
            renderEstoque();
            renderPrecos();
            renderStats();
            renderMaterialsTable();
        } else {
            showToast(data.error || 'Erro ao alterar status', 'error');
            await loadProdutos(); 
        }
    } catch (err) {
        showToast('Erro de conexão', 'error');
        await loadProdutos(); 
    }
}

// ══════════════════════════════
//  SEARCH & INIT
// ══════════════════════════════
function initSearch() {
    const searchPrecos = document.getElementById('searchPrecos');
    const searchEstoque = document.getElementById('searchEstoque');
    if (searchPrecos) searchPrecos.addEventListener('input', function() { renderPrecos(this.value); });
    if (searchEstoque) searchEstoque.addEventListener('input', function() { renderEstoque(this.value); });
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) initLogin();
    if (document.querySelector('.admin-dashboard')) {
        initTabs();
        initSearch();
        initMaterialForm();
        loadProdutos();
    }
});