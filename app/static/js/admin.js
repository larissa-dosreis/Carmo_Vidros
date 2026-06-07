/* ═══════════════════════════════════════════════
   Carmo Vidros — Admin Panel JavaScript
   ═══════════════════════════════════════════════ */

// ══════════════════════════════
//  STATE
// ══════════════════════════════
let produtos = [];
let deleteCallback = null;


// ══════════════════════════════
//  TOAST NOTIFICATIONS
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


// ══════════════════════════════
//  LOGIN
// ══════════════════════════════
function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        const btn = document.getElementById('loginBtn');

        if (!username || !password) {
            errorEl.textContent = 'Preencha todos os campos';
            errorEl.classList.add('show');
            return;
        }

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


// ══════════════════════════════
//  LOGOUT
// ══════════════════════════════
async function logout() {
    try {
        await fetch('/admin/logout', { method: 'POST' });
        window.location.href = '/admin/';
    } catch (err) {
        window.location.href = '/admin/';
    }
}


// ══════════════════════════════
//  TABS
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


// ══════════════════════════════
//  LOAD PRODUCTS
// ══════════════════════════════
async function loadProdutos() {
    try {
        const response = await fetch('/admin/api/produtos');
        if (response.status === 401) {
            window.location.href = '/admin/';
            return;
        }
        produtos = await response.json();
        renderPrecos();
        renderEstoque();
        renderStats();
        populateTipoSelect();
    } catch (err) {
        showToast('Erro ao carregar produtos', 'error');
    }
}


// ══════════════════════════════
//  STATS
// ══════════════════════════════
function renderStats() {
    const total = produtos.length;
    const ativos = produtos.filter(p => p.ativo !== false).length;
    const inativos = total - ativos;
    const categorias = [...new Set(produtos.map(p => p.tipo_produto))].length;

    const el = (id) => document.getElementById(id);
    if (el('statTotal')) el('statTotal').textContent = total;
    if (el('statAtivos')) el('statAtivos').textContent = ativos;
    if (el('statInativos')) el('statInativos').textContent = inativos;
    if (el('statCategorias')) el('statCategorias').textContent = categorias;

    // Update tab badge
    const badge = document.getElementById('stockBadge');
    if (badge) {
        badge.textContent = inativos;
        badge.style.display = inativos > 0 ? 'inline' : 'none';
    }
}


// ══════════════════════════════
//  PREÇOS TAB
// ══════════════════════════════
function renderPrecos(filter = '') {
    const tbody = document.getElementById('precosTableBody');
    if (!tbody) return;

    const filtered = filter
        ? produtos.filter(p =>
            p.Nome_produto.toLowerCase().includes(filter.toLowerCase()) ||
            p.tipo_produto.toLowerCase().includes(filter.toLowerCase())
        )
        : produtos;

    // Group by tipo_produto
    const grouped = {};
    filtered.forEach(p => {
        if (!grouped[p.tipo_produto]) grouped[p.tipo_produto] = [];
        grouped[p.tipo_produto].push(p);
    });

    if (Object.keys(grouped).length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted)">
                Nenhum produto encontrado
            </td></tr>`;
        return;
    }

    let html = '';
    for (const [tipo, prods] of Object.entries(grouped)) {
        html += `
            <tr class="category-row">
                <td colspan="4">
                    <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    ${tipo}
                </td>
            </tr>`;

        prods.forEach(p => {
            const statusClass = p.ativo !== false ? '' : 'style="opacity:0.5"';
            html += `
                <tr id="row-${p.id}" ${statusClass}>
                    <td style="padding-left:44px">${p.Nome_produto}</td>
                    <td>
                        <span class="price-display" id="price-display-${p.id}">
                            R$ ${parseFloat(p.preco_produto).toFixed(2)}<small>/m²</small>
                        </span>
                        <input type="number" class="price-edit-input" id="price-input-${p.id}"
                               value="${p.preco_produto}" step="0.01" min="0"
                               style="display:none" />
                    </td>
                    <td>
                        <span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:${p.ativo !== false ? '#16a34a' : '#dc2626'}">
                            <span style="width:8px;height:8px;border-radius:50%;background:${p.ativo !== false ? '#16a34a' : '#dc2626'}"></span>
                            ${p.ativo !== false ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        <span id="actions-view-${p.id}">
                            <button class="btn-action btn-edit" onclick="editPrice(${p.id})">
                                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Editar
                            </button>
                        </span>
                        <span id="actions-edit-${p.id}" style="display:none">
                            <button class="btn-action btn-save" onclick="savePrice(${p.id})">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                Salvar
                            </button>
                            <button class="btn-action btn-cancel" onclick="cancelEdit(${p.id})">
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                Cancelar
                            </button>
                        </span>
                    </td>
                </tr>`;
        });
    }

    tbody.innerHTML = html;
}

function editPrice(id) {
    document.getElementById(`price-display-${id}`).style.display = 'none';
    document.getElementById(`price-input-${id}`).style.display = 'inline-block';
    document.getElementById(`actions-view-${id}`).style.display = 'none';
    document.getElementById(`actions-edit-${id}`).style.display = 'inline';
    document.getElementById(`price-input-${id}`).focus();
}

function cancelEdit(id) {
    const produto = produtos.find(p => p.id === id);
    document.getElementById(`price-input-${id}`).value = produto.preco_produto;
    document.getElementById(`price-display-${id}`).style.display = 'inline';
    document.getElementById(`price-input-${id}`).style.display = 'none';
    document.getElementById(`actions-view-${id}`).style.display = 'inline';
    document.getElementById(`actions-edit-${id}`).style.display = 'none';
}

async function savePrice(id) {
    const input = document.getElementById(`price-input-${id}`);
    const novoPreco = parseFloat(input.value);

    if (isNaN(novoPreco) || novoPreco < 0) {
        showToast('Preço inválido', 'error');
        return;
    }

    try {
        const response = await fetch(`/admin/api/produto/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preco_produto: novoPreco })
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
//  MATERIAIS TAB
// ══════════════════════════════
function populateTipoSelect() {
    const select = document.getElementById('materialTipo');
    if (!select) return;

    const tipos = [...new Set(produtos.map(p => p.tipo_produto))].sort();
    
    // Keep first option (placeholder)
    select.innerHTML = '<option value="" disabled selected>Selecione ou digite novo...</option>';
    tipos.forEach(tipo => {
        select.innerHTML += `<option value="${tipo}">${tipo}</option>`;
    });
    select.innerHTML += '<option value="__novo__">+ Nova categoria...</option>';
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

    let tipo = selectTipo.value;
    if (tipo === '__novo__') {
        tipo = inputTipoNovo.value.trim();
    }

    const nome = inputNome.value.trim();
    const preco = parseFloat(inputPreco.value);

    if (!tipo || !nome || isNaN(preco) || preco <= 0) {
        showToast('Preencha todos os campos corretamente', 'error');
        return;
    }

    try {
        const response = await fetch('/admin/api/produto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo_produto: tipo,
                Nome_produto: nome,
                preco_produto: preco
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Material adicionado com sucesso');
            inputNome.value = '';
            inputPreco.value = '';
            inputTipoNovo.value = '';
            inputTipoNovo.style.display = 'none';
            selectTipo.selectedIndex = 0;
            await loadProdutos();
        } else {
            showToast(data.error || 'Erro ao adicionar', 'error');
        }
    } catch (err) {
        showToast('Erro de conexão', 'error');
    }
}


// Material list
function renderMaterialList() {
    // This is handled by the table in renderPrecos
}

function confirmDelete(id, nome) {
    const overlay = document.getElementById('confirmOverlay');
    const text = document.getElementById('confirmText');
    
    text.textContent = `Tem certeza que deseja remover "${nome}"? Esta ação não pode ser desfeita.`;
    overlay.classList.add('show');

    deleteCallback = async function() {
        try {
            const response = await fetch(`/admin/api/produto/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                showToast(data.message);
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

function executeDelete() {
    if (deleteCallback) deleteCallback();
}

function closeConfirm() {
    const overlay = document.getElementById('confirmOverlay');
    overlay.classList.remove('show');
    deleteCallback = null;
}


// ══════════════════════════════
//  ESTOQUE TAB
// ══════════════════════════════
function renderEstoque(filter = '') {
    const container = document.getElementById('stockGrid');
    if (!container) return;

    const filtered = filter
        ? produtos.filter(p =>
            p.Nome_produto.toLowerCase().includes(filter.toLowerCase()) ||
            p.tipo_produto.toLowerCase().includes(filter.toLowerCase())
        )
        : produtos;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <h3>Nenhum produto encontrado</h3>
                <p>Adicione produtos na aba "Materiais"</p>
            </div>`;
        return;
    }

    let html = '';
    filtered.forEach(p => {
        const ativo = p.ativo !== false;
        html += `
            <div class="stock-card ${ativo ? '' : 'inactive'}" id="stock-${p.id}">
                <div class="stock-info">
                    <div class="stock-tipo">${p.tipo_produto}</div>
                    <div class="stock-nome">${p.Nome_produto}</div>
                    <div class="stock-preco">R$ ${parseFloat(p.preco_produto).toFixed(2)} /m²</div>
                    <div class="stock-status ${ativo ? 'ativo' : 'inativo'}">
                        ${ativo ? '● Disponível' : '● Em falta'}
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
        const response = await fetch(`/admin/api/produto/${id}/toggle`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message);
            // Update local state
            const produto = produtos.find(p => p.id === id);
            if (produto) produto.ativo = data.ativo;
            renderEstoque();
            renderPrecos();
            renderStats();
        } else {
            showToast(data.error || 'Erro ao alterar status', 'error');
            await loadProdutos(); // Revert
        }
    } catch (err) {
        showToast('Erro de conexão', 'error');
        await loadProdutos(); // Revert
    }
}


// ══════════════════════════════
//  SEARCH
// ══════════════════════════════
function initSearch() {
    const searchPrecos = document.getElementById('searchPrecos');
    const searchEstoque = document.getElementById('searchEstoque');

    if (searchPrecos) {
        searchPrecos.addEventListener('input', function() {
            renderPrecos(this.value);
        });
    }
    if (searchEstoque) {
        searchEstoque.addEventListener('input', function() {
            renderEstoque(this.value);
        });
    }
}


// ══════════════════════════════
//  RENDER MATERIAL DELETE LIST
// ══════════════════════════════
function renderMaterialsTable() {
    const tbody = document.getElementById('materiaisTableBody');
    if (!tbody) return;

    // Group by tipo
    const grouped = {};
    produtos.forEach(p => {
        if (!grouped[p.tipo_produto]) grouped[p.tipo_produto] = [];
        grouped[p.tipo_produto].push(p);
    });

    let html = '';
    for (const [tipo, prods] of Object.entries(grouped)) {
        html += `
            <tr class="category-row">
                <td colspan="4">
                    <svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    ${tipo}
                </td>
            </tr>`;

        prods.forEach(p => {
            html += `
                <tr>
                    <td style="padding-left:44px">${p.Nome_produto}</td>
                    <td>R$ ${parseFloat(p.preco_produto).toFixed(2)}/m²</td>
                    <td>
                        <span style="color:${p.ativo !== false ? '#16a34a' : '#dc2626'};font-size:12px;font-weight:600">
                            ${p.ativo !== false ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        <button class="btn-action btn-delete" onclick="confirmDelete(${p.id}, '${p.Nome_produto.replace(/'/g, "\\'")}')">
                            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            Remover
                        </button>
                    </td>
                </tr>`;
        });
    }

    tbody.innerHTML = html;
}


// ══════════════════════════════
//  OVERRIDES for renderPrecos to also update material table
// ══════════════════════════════
const _originalLoadProdutos = loadProdutos;
loadProdutos = async function() {
    try {
        const response = await fetch('/admin/api/produtos');
        if (response.status === 401) {
            window.location.href = '/admin/';
            return;
        }
        produtos = await response.json();
        renderPrecos();
        renderEstoque();
        renderStats();
        populateTipoSelect();
        renderMaterialsTable();
    } catch (err) {
        showToast('Erro ao carregar produtos', 'error');
    }
};


// ══════════════════════════════
//  INIT
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    const loginForm = document.getElementById('loginForm');
    const dashboard = document.querySelector('.admin-dashboard');

    if (loginForm) {
        initLogin();
    }

    if (dashboard) {
        initTabs();
        initSearch();
        initMaterialForm();
        loadProdutos();
    }
});
