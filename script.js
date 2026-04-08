const numero = "5537998628364"; // seu número
let opcoes;
let valorDinheiro;
let opcaoSelecionada = 0; // Índice da opção principal selecionada
// Só inicializa a calculadora se os elementos existirem na página
const opcoesEl = document.getElementById("opcoes");
const subopcoesEl = document.getElementById("subOpcoes");



if (opcoesEl) {
    opcoesEl.addEventListener("change", function() {
        const valor = this.value;
        const indexSelecionado = this.selectedIndex;
        opcaoSelecionada = indexSelecionado;
        document.getElementById("resultado").innerText = "R$ —";  // isso para limpar o resultado toda vez
       limparSubopcoes();
       ajuda = false;
       subopcoesEl.selectedIndex = 0; 
       

        if (indexSelecionado === 1) {
            adicionarOpcao("Vidro incolor com acabamento fosco (cor original do alumínio)");
            adicionarOpcao("Vidro incolor com acabamento com cor (Preto, branco, bronze e grafite)");
            adicionarOpcao("Vidro com cor (fumê, verde, bronze e espelhado) com acabamento fosco");
            adicionarOpcao("Vidro com cor com acabamento com cor");
        } else if (indexSelecionado === 2) {
            adicionarOpcao("Vidro incolor com acabamento fosco (cor original do alumínio)");
            adicionarOpcao("Vidro incolor com acabamento com cor (Preto, branco, bronze e grafite)");
            adicionarOpcao("Vidro com cor (fumê, verde, bronze (Vidro espelhado não tem película))");
            adicionarOpcao("Vidro com cor com acabamento com cor");
           
        } else if (indexSelecionado === 3) {
            adicionarOpcao("Película e acabamento fosco");
            adicionarOpcao("Película e acabamento com cor");
        } else if (indexSelecionado === 4) {
            adicionarOpcao("6mm");
            adicionarOpcao("8mm");
            adicionarOpcao("10mm");
        } else if (indexSelecionado === 5) {
            adicionarOpcao("Instalar após limpar o vão e remover os excessos de massa.");
            adicionarOpcao("Instalar sem a necessidade de limpar o vão ou remover os excessos de massa.");
        }else if (indexSelecionado === 6) {
            adicionarOpcao("Espelho comum");
            adicionarOpcao("Espelho Bizotado")
        }

        
    });
}

//Adicionar as Subopções e os preços de cada subopção

if(subopcoesEl){
        subopcoesEl.addEventListener("change", function() {
            const valor = this.value;
            valorDinheiro = null;

            // Vidro temperado SEM película (opcaoSelecionada === 1)
            if (opcaoSelecionada === 1) {
                if(valor === "Vidro incolor com acabamento fosco (cor original do alumínio)"){
                    valorDinheiro = 400;
                }
                if(valor === "Vidro incolor com acabamento com cor (Preto, branco, bronze e grafite)"){
                    valorDinheiro = 430;
                }
                if(valor === "Vidro com cor (fumê, verde, bronze e espelhado) com acabamento fosco"){
                    valorDinheiro = 450;
                }
                if(valor === "Vidro com cor com acabamento com cor"){
                    valorDinheiro = 500;
                }
            }

            // Vidro temperado COM película (opcaoSelecionada === 2)
            if (opcaoSelecionada === 2) {
                if(valor === "Vidro incolor com acabamento fosco (cor original do alumínio)"){
                    valorDinheiro = 420;
                }
                if(valor === "Vidro incolor com acabamento com cor (Preto, branco, bronze e grafite)"){
                    valorDinheiro = 450;
                }
                if(valor === "Vidro com cor (fumê, verde, bronze (Vidro espelhado não tem película))"){
                    valorDinheiro = 470;
                }
                if(valor === "Vidro com cor com acabamento com cor"){
                    valorDinheiro = 520;
                }
            }

            // Fechamentos de pia de vidro com película (opcaoSelecionada === 3)
            if (opcaoSelecionada === 3) {
                if(valor === "Película e acabamento fosco"){
                    valorDinheiro = 450;
                }
                if(valor === "Película e acabamento com cor"){
                    valorDinheiro = 500;
                }
            }

            // Vidro laminado (opcaoSelecionada === 4)
            if (opcaoSelecionada === 4) {
                if(valor === "6mm"){
                    valorDinheiro = 500;
                }
                if(valor === "8mm"){
                    valorDinheiro = 600;
                }
                if(valor === "10mm"){
                    valorDinheiro = 800;
                }
            }

            // Vidro Comum (opcaoSelecionada === 5)
            if (opcaoSelecionada === 5) {
                if(valor === "Instalar após limpar o vão e remover os excessos de massa."){
                    valorDinheiro = 270;
                }
                if(valor === "Instalar sem a necessidade de limpar o vão ou remover os excessos de massa."){
                    valorDinheiro = 240;
                }
            }

            // Espelhos (opcaoSelecionada === 6)
            if (opcaoSelecionada === 6) {
                if(valor === "Espelho comum"){
                    valorDinheiro = 300;
                }
                if(valor === "Espelho Bizotado"){
                    valorDinheiro = 350;
                }
            }

            if (valorDinheiro !== null) {
            document.getElementById("resultado").innerText =
                "R$ " + valorDinheiro.toFixed(2);
        } else {
            document.getElementById("resultado").innerText = "";
        }
        

});
}//fim do if

function limparSubopcoes() {
     subopcoesEl.options.length = 1;
    while (subopcoesEl.options.length > 1) {
    subopcoesEl.remove(1);
     
}}

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