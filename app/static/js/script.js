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

    // Limpa opções existentes (mantém apenas o placeholder)
    while (opcoesEl.options.length > 1) {
        opcoesEl.remove(1);
    }

    // Adiciona categorias do banco de dados
    dadosProdutos.forEach(cat => {
        const option = document.createElement("option");
        option.text = cat.tipo;
        option.value = cat.tipo;
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
    
    const altura = parseMetros(document.getElementById("Altura").value);
    const largura = parseMetros(document.getElementById("Largura").value);
    const opcoes = document.getElementById("opcoes").value;
    const subOpcoes = document.getElementById("subOpcoes").value;
        //ifs para opções vazias 
    if (isNaN(altura) || isNaN(largura) || altura <= 0 || largura <= 0) {
        alert("Preencha altura e largura corretamente");
        return;
    }

    if (!opcoesEl.value) {
    // NÃO selecionou nada
   alert("Selecione um valor para tipo e subtipo");
        return;
} 
    

    const resultado = (altura * largura) * valorDinheiro;

    abrirTela(resultado, altura, largura, valorDinheiro, opcoes, subOpcoes);
}

function abrirTela(valor, altura, largura, valorDinheiro, opcoes, subOpcoes) {
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

    const mensagem = `Olá! Acabei de fazer um orçamento pelo site e gostaria de dar continuidade.

Dados do orçamento:
- Altura: ${alturaFormatada} m
- Largura: ${larguraFormatada} m
- Tipo: ${opcoes} 
- Subtipo: ${subOpcoes}

- Valor Total: R$ ${valorTotalFormatado}

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