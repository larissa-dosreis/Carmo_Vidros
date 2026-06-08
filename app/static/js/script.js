const numero = "5537998628364"; // seu número
let opcoes;
let valorDinheiro;
let opcaoSelecionada = 0; // Índice da opção principal selecionada
let dadosProdutos = []; // Dados dinâmicos do banco de dados

// Só inicializa a calculadora se os elementos existirem na página
const opcoesEl = document.getElementById("opcoes");
const subopcoesEl = document.getElementById("subOpcoes");


// ══════════════════════════════
//  CARREGAR DADOS DO BANCO
// ══════════════════════════════
async function carregarTiposVidro() {
    try {
        const response = await fetch('/api/tipos_vidro');
        dadosProdutos = await response.json();
        popularCategorias();
    } catch (err) {
        console.error('Erro ao carregar tipos de vidro:', err);
        // Se falhar, a calculadora fica sem opções
    }
}

function popularCategorias() {
    if (!opcoesEl || dadosProdutos.length === 0) return;

    while (opcoesEl.options.length > 1) {
        opcoesEl.remove(1);
    }

    dadosProdutos.forEach(cat => {
        const option = document.createElement("option");
        
        // MUDANÇA AQUI: Use 'tipo' porque é o que seu Python envia
        option.text = cat.tipo; 
        option.value = cat.tipo;
        
        // MUDANÇA AQUI: Use 'id_categoria' conforme seu Python envia
        option.dataset.id = cat.id_categoria; 
        
        opcoesEl.appendChild(option);
    });
}

// ══════════════════════════════
//  EVENTOS DE SELEÇÃO
// ══════════════════════════════
if (opcoesEl) {
    opcoesEl.addEventListener("change", function() {
        const indexSelecionado = this.selectedIndex;
        opcaoSelecionada = indexSelecionado;
        document.getElementById("resultado").innerText = "R$ —";
        limparSubopcoes();
        subopcoesEl.selectedIndex = 0;

        // Busca a categoria selecionada nos dados do banco
        // Index 0 é o placeholder, então o índice da categoria é indexSelecionado - 1
        const categoriaIndex = indexSelecionado - 1;
        if (categoriaIndex >= 0 && categoriaIndex < dadosProdutos.length) {
            const categoria = dadosProdutos[categoriaIndex];
            categoria.produtos.forEach(produto => {
                adicionarOpcao(produto.nome);
            });
        }
    });
}

// Seleção de sub-opção e definição do preço
if (subopcoesEl) {
    subopcoesEl.addEventListener("change", function() {
        const valor = this.value;
        valorDinheiro = null;

        // Busca o preço na categoria selecionada
        const categoriaIndex = opcaoSelecionada - 1;
        if (categoriaIndex >= 0 && categoriaIndex < dadosProdutos.length) {
            const categoria = dadosProdutos[categoriaIndex];
            const produto = categoria.produtos.find(p => p.nome === valor);
            if (produto) {
                valorDinheiro = produto.preco;
            }
        }

        if (valorDinheiro !== null) {
            document.getElementById("resultado").innerText =
                "R$ " + valorDinheiro.toFixed(2);
        } else {
            document.getElementById("resultado").innerText = "";
        }
    });
}

function limparSubopcoes() {
    if (!subopcoesEl) return;
    subopcoesEl.options.length = 1;
    while (subopcoesEl.options.length > 1) {
        subopcoesEl.remove(1);
    }
}

//Adiciona as Opções de subopções
function adicionarOpcao(texto) {
    const option = document.createElement("option");
    option.text = texto;
    option.value = texto;
    subopcoesEl.appendChild(option);
}

// Função para formatar o valor com vírgula automaticamente (metros)
function formatarMetros(input) {
    // Remove tudo que não é dígito
    let valor = input.value.replace(/\D/g, "");
    
    // Remove zeros à esquerda (mas mantém pelo menos um dígito)
    valor = valor.replace(/^0+/, "") || "0";
    
    // Garante pelo menos 3 dígitos para ter ao menos 0,XX
    while (valor.length < 3) {
        valor = "0" + valor;
    }
    
    // Insere a vírgula antes dos dois últimos dígitos
    const inteiro = valor.slice(0, -2);
    const decimal = valor.slice(-2);
    
    input.value = inteiro + "," + decimal;
}

// Função para converter valor formatado (com vírgula) em número
function parseMetros(valor) {
    if (!valor || valor.trim() === "") return NaN;
    // Substitui vírgula por ponto para parsear
    return parseFloat(valor.replace(",", "."));
}

// Adiciona auto-formatação nos campos de altura e largura
const alturaInput = document.getElementById("Altura");
const larguraInput = document.getElementById("Largura");

if (alturaInput) {
    alturaInput.addEventListener("input", function() {
        formatarMetros(this);
    });
}
if (larguraInput) {
    larguraInput.addEventListener("input", function() {
        formatarMetros(this);
    });
}

function calcular() {
    // 1. Pega os dados básicos
    const nome = document.getElementById("nomeCliente").value.trim();
    const telefone = document.getElementById("telefoneCliente").value.trim();
    const altura = parseMetros(document.getElementById("Altura").value);
    const largura = parseMetros(document.getElementById("Largura").value);
    const opcoes = document.getElementById("opcoes").value;
    const subOpcoes = document.getElementById("subOpcoes").value;

    // 2. Validações
    if (!nome || telefone.length < 14) {
        alert("Preencha seu Nome e Telefone corretamente para ver o orçamento.");
        return;
    }

    if (isNaN(altura) || isNaN(largura) || altura <= 0 || largura <= 0) {
        alert("Preencha altura e largura corretamente");
        return;
    }

    if (!opcoes || !subOpcoes) {
        alert("Selecione um tipo e um subtipo de vidro.");
        return;
    }

    // 3. Calcula o valor
    const resultado = (altura * largura) * valorDinheiro;

    // 4. Busca o ID do Subproduto corretamente nos dados do banco
    const categoriaIndex = opcaoSelecionada - 1;
    const categoria = dadosProdutos[categoriaIndex];
    
    // CORREÇÃO AQUI: Procura tanto por 'nome' quanto por 'nome_subproduto'
    const subprodutoSelecionado = categoria.produtos.find(
        p => p.nome === subOpcoes || p.nome_subproduto === subOpcoes
    );
    
    // Pega o ID (garante que existe)
    const idSubProduto = subprodutoSelecionado ? subprodutoSelecionado.id : null;

    if (!idSubProduto) {
        console.error("ID do subproduto não encontrado. Verifique o console.");
        console.log("SubOpção procurada:", subOpcoes);
        console.log("Lista de produtos disponíveis:", categoria.produtos);
        alert("Erro ao processar o item selecionado. Tente novamente.");
        return;
    }

    // 5. Dispara a função para salvar no banco com o ID do subproduto
    salvarLead(nome, telefone, idSubProduto);

    // 6. Continua o fluxo abrindo a tela de resultados
    abrirTela(resultado, altura, largura, valorDinheiro, opcoes, subOpcoes, nome, telefone);
}

function abrirTela(valor, altura, largura, valorDinheiro, opcoes, subOpcoes, nome, telefone) {
    // Formata o valor no padrão brasileiro (ponto para milhar, vírgula para decimal)
    const valorFormatado = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.getElementById("valorFinal").innerText =
        `R$ ${valorFormatado}`;

    // Formata com vírgula para exibição
    const alturaFormatada = altura.toFixed(2).replace(".", ",");
    const larguraFormatada = largura.toFixed(2).replace(".", ",");

    document.getElementById("resAltura").innerText = `${alturaFormatada} m`;
    document.getElementById("resLargura").innerText = `${larguraFormatada} m`;
    document.getElementById("resTipo").innerText = document.getElementById("opcoes").value;
    document.getElementById("resSubtipo").innerText = document.getElementById("subOpcoes").value;

    const valorTotalFormatado = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Substitua apenas a parte de criação da mensagem dentro da abrirTela()
const mensagem = `Olá! Meu nome é *${nome}*. Acabei de fazer um orçamento pelo site e gostaria de dar continuidade.

Dados do orçamento:
- Altura: ${alturaFormatada} m
- Largura: ${larguraFormatada} m
- Tipo: ${opcoes} 
- Subtipo: ${subOpcoes}

- Valor Total: *R$ ${valorTotalFormatado}*

Poderia me confirmar os detalhes, prazo e forma de pagamento?`;

    const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    document.getElementById("btnWhats").href = link;

    document.getElementById("overlay").style.display = "flex";
}

function fecharTela() {
    document.getElementById("overlay").style.display = "none";
}

function limparCampos() {
    document.getElementById("Altura").value = "";
    document.getElementById("Largura").value = "";
    limparSubopcoes();
    document.getElementById("subOpcoes").selectedIndex = 0;
    document.getElementById("opcoes").selectedIndex = 0;
    document.getElementById("resultado").innerText = "R$ —";
    
}


// ══════════════════════════════
//  INICIALIZAÇÃO
// ══════════════════════════════
// Carrega os dados do banco quando a página carrega
if (opcoesEl) {
    carregarTiposVidro();
}

// ══════════════════════════════
//  MÁSCARA DE TELEFONE
// ══════════════════════════════
const telefoneInput = document.getElementById("telefoneCliente");
if (telefoneInput) {
    telefoneInput.addEventListener("input", function (e) {
        // Remove tudo que não é número
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        // Aplica a formatação (XX) XXXXX-XXXX
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
}


// ══════════════════════════════
//  SALVAR LEAD (BANCO DE DADOS)
// ══════════════════════════════
async function salvarLead(nome, telefoneFormatado, idProduto) {
    // Transforma "(37) 99862-8364" em 37998628364 (pois o banco exige int8)
    const telefoneNumeros = parseInt(telefoneFormatado.replace(/\D/g, ""));

    const dadosLead = {
        Nome_usuario: nome,
        telefone: telefoneNumeros,
        FK_subproduto: parseInt(idProduto)
    };

    try {
        // Essa será a rota no seu app.py para receber os dados
        const response = await fetch('/api/novo_lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosLead)
        });
        
        const result = await response.json();
        console.log("Lead salvo com sucesso no banco:", result);
    } catch (err) {
        console.error('Erro ao salvar lead:', err);
    }
}