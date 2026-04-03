const numero = "5537998628364"; // seu número
let opcoes;
let valorDinheiro;
// Só inicializa a calculadora se os elementos existirem na página
const opcoesEl = document.getElementById("opcoes");
const subopcoesEl = document.getElementById("subOpcoes");

if (opcoesEl) {
    opcoesEl.addEventListener("change", function() {
        const valor = this.value;
        document.getElementById("resultado").innerText = "R$ —";  // isso para limpar o resultado toda vez
       limparSubopcoes();
       subopcoesEl.selectedIndex = 0; 
       

        if (valor === "Vidro temperado sem película") {
            adicionarOpcao("Vidro incolor com acabamento fosco (cor original do alumínio)");
            adicionarOpcao("Vidro incolor com acabamento com cor (Preto, branco, bronze e grafite)");
            adicionarOpcao("Vidro com cor (fumê, verde, bronze e espelhado) com acabamento fosco");
            adicionarOpcao("Vidro com cor com acabamento com cor");
        } else if (valor === "Vidro temperado com película") {
            adicionarOpcao("Vidro incolor com acabamento fosco (cor original do alumínio)");
            adicionarOpcao("Vidro incolor com acabamento com cor (Preto, branco, bronze e grafite)");
            adicionarOpcao("Vidro com cor (fumê, verde, bronze (Vidro espelhado não tem película))");
            adicionarOpcao("Vidro com cor com acabamento com cor");
           
        } else if (valor === "Fechamentos de pia de vidro com película") {
            adicionarOpcao("Película e acabamento fosco");
            adicionarOpcao("Película e acabamento com cor");
        } else if (valor === "Vidro laminado") {
            adicionarOpcao("6mm");
            adicionarOpcao("8mm");
            adicionarOpcao("10mm");
        } else if (valor === "Nenhuma") {
            
        }

        
    });
}

//Adicionar as Subopções e os preços de cada subopção

if(subopcoesEl){
        subopcoesEl.addEventListener("change", function() {
            const valor = this.value;
            valorDinheiro = null;
            //Primeira opção do Select as Opções de Vidro temperado sem película
            if(valor === "Vidro incolor com acabamento fosco (cor original do alumínio)"){
                valorDinheiro = 0.04;
            }
            //Segunda opção do Select as Opções de Vidro temperado sem película
            if(valor === "Vidro incolor com acabamento com cor (Preto, branco, bronze e grafite)"){
                valorDinheiro = 0.043;
            }
            //Terceira opção do Select as Opções de Vidro temperado sem película
            if(valor === "Vidro com cor (fumê, verde, bronze e espelhado) com acabamento fosco"){
                valorDinheiro = 0.045;
            }
            //Quarta opção do Select as Opções de Vidro temperado sem película
            if(valor === "Vidro com cor com acabamento com cor"){
                valorDinheiro = 0.05;
            }



            //Segundo Opção do Select as Opções de Vidro temperado com película
            if(valor === "Vidro incolor com acabamento fosco (cor original do alumínio)"){
                valorDinheiro = 0.042;
            }
            if(valor === "Vidro incolor com acabamento com cor (Preto, branco, bronze e grafite)"){
                valorDinheiro = 0.045;
            }
            if(valor === "Vidro com cor (fumê, verde, bronze (Vidro espelhado não tem película))"){
                valorDinheiro = 0.047;
            }
            if(valor === "Vidro com cor com acabamento com cor"){
                valorDinheiro = 0.052;
            }

            //Terceira opção do Select as Opções de Fechamentos de pia de vidro com película
                if(valor === "Película e acabamento fosco"){
                    valorDinheiro = 0.045;
                }
                if(valor === "Película e acabamento com cor"){
                    valorDinheiro = 0.05;
                }


                //Quarta opção do Select as Opções de Preço vidro laminado
                if(valor === "6mm"){
                    valorDinheiro = 0.05;
                }
                if(valor === "8mm"){
                    valorDinheiro = 0.06;
                }
                if(valor === "10mm"){
                    valorDinheiro = 0.08;
                }












            
            if (valorDinheiro !== null) {
            document.getElementById("resultado").innerText =
                "R$ " + valorDinheiro.toFixed(3);
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

function calcular() {
    
    const altura = parseFloat(document.getElementById("Altura").value);
    const largura = parseFloat(document.getElementById("Largura").value);
    const opcoes = document.getElementById("opcoes").value;
    const subOpcoes = document.getElementById("subOpcoes").value;
        //ifs para opções vazias 
    if (isNaN(altura) || isNaN(largura)) {
        document.getElementById("resultado").innerText = "Preencha altura e largura";
        return;
    }

    if (!opcoesEl.value) {
    // NÃO selecionou nada
   document.getElementById("resultado").innerText = "Selecione um valor para tipo e subtipo";
        return;
} 

    const resultado = ((altura) * (largura))  * valorDinheiro;

    abrirTela(resultado, altura, largura,valorDinheiro,opcoes,subOpcoes);
}

function abrirTela(valor, altura, largura,valorDinheiro, opcoes, subOpcoes) {
    document.getElementById("valorFinal").innerText =
        `R$ ${valor.toFixed(2)}`;

    document.getElementById("resAltura").innerText = `${altura} cm`;
    document.getElementById("resLargura").innerText = `${largura} cm`;
    document.getElementById("resTipo").innerText = document.getElementById("opcoes").value;
    document.getElementById("resSubtipo").innerText = document.getElementById("subOpcoes").value;
    document.getElementById("resValorDinheiro").innerText = `R$ ${valorDinheiro.toFixed(2)}`;

    const mensagem = `Olá! Acabei de fazer um orçamento pelo site e gostaria de dar continuidade.

Dados do orçamento:
- Altura: ${altura} cm
- Largura: ${largura} cm
- Tipo: ${opcoes} 
- Subtipo: ${subOpcoes}
- Valor por Centimetro quadrado: R$ ${valorDinheiro.toFixed(2)}

- Valor Total: R$ ${valor.toFixed(2)}

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