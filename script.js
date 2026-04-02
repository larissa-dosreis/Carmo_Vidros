function calcular() {
    const altura = parseFloat(document.getElementById("Altura").value);
    const largura = parseFloat(document.getElementById("Largura").value);

    if (isNaN(altura) || isNaN(largura)) {
        document.getElementById("resultado").innerText = "Preencha altura e largura";
        return;
    }

    const valor = 2;
    const resultado = (altura * largura) * valor;

    document.getElementById("resultado").innerText = "R$ " + resultado.toFixed(2);
}