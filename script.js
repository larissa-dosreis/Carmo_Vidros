const numero = "5537998628364"; // seu número
let = opcoes;

function calcular() {
    const altura = parseFloat(document.getElementById("Altura").value);
    const largura = parseFloat(document.getElementById("Largura").value);

    if (isNaN(altura) || isNaN(largura)) {
        document.getElementById("resultado").innerText = "Preencha altura e largura";
        return;
    }

    
    const resultado = (altura * largura) * opcoes;

    
    abrirTela(resultado, altura, largura);

}

document.getElementById("opcoes").addEventListener("change", function() {
    const valor = this.value;
    let resultado = "";

    if (valor === "Box de Banheiro — Vidro 8mm") {
        resultado = 100;
    } else if (valor === "Box de Banheiro — Vidro 10mm") {
        resultado = 200;
    } else if (valor === "Janela de Correr") {
        resultado = 300;
    } else {
        resultado = "";
    }
    opcoes = resultado;
    document.getElementById("resultado").innerText = "R$ " + resultado.toFixed(2);
});

function abrirTela(valor, altura, largura) {
    

    

    document.getElementById("valorFinal").innerText =
        `R$ ${valor.toFixed(2)}`;

    document.getElementById("resAltura").innerText = `${altura} cm`;
    document.getElementById("resLargura").innerText = `${largura} cm`;
    document.getElementById("resTipo").innerText = document.getElementById("opcoes").value;

    
    const mensagem = `Olá! Acabei de fazer um orçamento pelo site e gostaria de dar continuidade.

Dados do orçamento:
- Altura: ${altura}
- Largura: ${largura}
- Tipo: ${opcoes}
- Valor: R$ ${valor.toFixed(2)}

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
    document.getElementById("opcoes").selectedIndex = 0;
    document.getElementById("resultado").innerText = "R$ —";
}