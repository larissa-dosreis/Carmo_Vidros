# 📋 Mudanças Realizadas no Sistema de Orçamento — Carmo Vidros

---

## 🔄 Resumo das Mudanças

### 1. Medidas trocadas de Centímetros para Metros
- Os rótulos "Altura (Centimetros)" e "Largura (centimetros)" foram alterados para **"Altura (Metros)"** e **"Largura (Metros)"**.
- Os placeholders (textos de exemplo dentro do campo) mudaram de `Ex: 2.00` para `Ex: 2,00`.

### 2. Vírgula automática nos campos de medida
- Antes: o usuário digitava um número com ponto (ex: `2.00`).
- Agora: o usuário só digita números e a **vírgula é inserida automaticamente**. Exemplo: ao digitar `200`, o campo mostra `2,00`. Ao digitar `150`, mostra `1,50`.

### 3. Removida a exibição do "Valor do Centímetro Quadrado"
- Na calculadora, a área que mostrava "Valor do Centímetro Quadrado: R$ 0.040" foi **escondida**.
- No resumo do orçamento (a tela que aparece depois de calcular), a linha "Valor por Centimetro Quadrado" foi **removida**.
- Na mensagem do WhatsApp, a linha "Valor por Centimetro quadrado" também foi **removida**.

### 4. Preços corrigidos para Metro Quadrado
Os preços estavam usando valores antigos baseados em centímetros. Foram corrigidos conforme o documento de referência:

| Categoria | Sub-opção | Preço Antigo | Preço Novo (R$/m²) |
|---|---|---|---|
| **Sem película** | Incolor + fosco | 0,04 | **400,00** |
| | Incolor + cor | 0,043 | **430,00** |
| | Cor + fosco | 0,045 | **450,00** |
| | Cor + cor | 0,05 | **500,00** |
| **Com película** | Incolor + fosco | 0,042 | **420,00** |
| | Incolor + cor | 0,045 | **450,00** |
| | Cor + fosco | 0,047 | **470,00** |
| | Cor + cor | 0,052 | **520,00** |
| **Fechamento pia** | Película + fosco | 0,045 | **450,00** |
| | Película + cor | 0,05 | **500,00** |
| **Laminado** | 6mm | 0,05 | **500,00** |
| | 8mm | 0,06 | **600,00** |
| | 10mm | 0,08 | **800,00** |
| **Vidro Comum** | Limpar vão | 0,027 | **270,00** |
| | Sem limpar | 0,024 | **240,00** |
| **Espelhos** | Comum | 0,03 | **300,00** |
| | Bizotado | 0,035 | **350,00** |

### 5. Bug corrigido: preços de "sem película" e "com película"
- **Antes:** Algumas sub-opções de "sem película" e "com película" tinham o mesmo nome de texto (ex: "Vidro incolor com acabamento fosco"). Como o código verificava todas as opções de forma sequencial, o preço de "com película" sempre sobrescrevia o de "sem película", então o preço "sem película" nunca era aplicado corretamente.
- **Agora:** O código guarda **qual opção principal foi selecionada** (a variável `opcaoSelecionada`) e só verifica os preços da categoria correta.

### 6. Unidades atualizadas no resumo e WhatsApp
- No resumo do orçamento: `150 cm` → `1,50 m`
- Na mensagem do WhatsApp: `Altura: 150 cm` → `Altura: 1,50 m`

---

## 📖 Explicação do Código Ponto a Ponto

> 💡 Abaixo explico **cada parte** do arquivo `script.js` como se você nunca tivesse programado. Pense no código como uma **receita de bolo**: cada linha é uma instrução que o computador segue, uma por uma, de cima para baixo.

---

### 🟢 Parte 1 — As "caixinhas" de informação (variáveis)

```javascript
const numero = "5537998628364";
let opcoes;
let valorDinheiro;
let opcaoSelecionada = 0;
```

Imagine que variáveis são **caixinhas com etiquetas**. Você coloca algo dentro e depois pode usar.

- `numero` → Caixinha com o número do WhatsApp da Carmo Vidros. O `const` significa que essa caixinha **nunca muda**.
- `opcoes` → Caixinha que vai guardar qual tipo de vidro o usuário escolheu.
- `valorDinheiro` → Caixinha que vai guardar o **preço por metro quadrado** do vidro escolhido.
- `opcaoSelecionada` → Caixinha que guarda **qual categoria principal** o usuário selecionou (1 = sem película, 2 = com película, etc). Começa em `0` (nenhuma selecionada).

---

### 🟢 Parte 2 — Encontrando os campos na página

```javascript
const opcoesEl = document.getElementById("opcoes");
const subopcoesEl = document.getElementById("subOpcoes");
```

Pense na página web como uma **folha de papel com vários campos**. Cada campo tem um nome (um ID).

- `document.getElementById("opcoes")` → É como dizer: *"Vai na folha e encontra o campo que se chama 'opcoes'"*. Esse campo é a caixa de seleção "Tipo de Produto".
- `document.getElementById("subOpcoes")` → Encontra a caixa de "Tipo de Sub-Produto".

Guardamos esses campos em caixinhas (`opcoesEl` e `subopcoesEl`) para usar depois.

---

### 🟢 Parte 3 — Quando o usuário escolhe um Tipo de Produto

```javascript
if (opcoesEl) {
    opcoesEl.addEventListener("change", function() {
```

- `if (opcoesEl)` → *"Se o campo de opções existe na página..."* (proteção para não dar erro se a página não tiver esse campo).
- `addEventListener("change", ...)` → *"Fique de olho nesse campo. Quando alguém mudar a seleção, faça o seguinte..."*

```javascript
        const indexSelecionado = this.selectedIndex;
        opcaoSelecionada = indexSelecionado;
```

- `this.selectedIndex` → Pega o **número da posição** do item que o usuário selecionou. Exemplo:
  - Posição 0 = "Selecione o tipo de vidro..." (o texto padrão)
  - Posição 1 = "Vidro temperado sem película"
  - Posição 2 = "Vidro temperado com película"
  - ... e assim por diante.
- Guardamos esse número em `opcaoSelecionada` para usar depois quando o subtipo for selecionado.

```javascript
        limparSubopcoes();
        subopcoesEl.selectedIndex = 0;
```

- Limpa todas as sub-opções antigas e volta o campo de sub-produto para a posição inicial.

```javascript
        if (indexSelecionado === 1) {
            adicionarOpcao("Vidro incolor com acabamento fosco...");
            adicionarOpcao("Vidro incolor com acabamento com cor...");
            // ... mais opções
        } else if (indexSelecionado === 2) {
            // opções para "com película"
        }
        // ... e assim por diante para cada categoria
```

- Dependendo de qual tipo o usuário escolheu, **adiciona as sub-opções corretas** na segunda caixa de seleção.
- `if ... else if` → É como uma bifurcação: *"Se escolheu a opção 1, faça isso. Senão, se escolheu a opção 2, faça aquilo."*

---

### 🟢 Parte 4 — Quando o usuário escolhe um Subtipo

```javascript
if(subopcoesEl){
    subopcoesEl.addEventListener("change", function() {
        const valor = this.value;
        valorDinheiro = null;
```

- Quando o usuário muda o subtipo, pegamos o texto selecionado (`this.value`) e zeramos o preço (`valorDinheiro = null`).

```javascript
        if (opcaoSelecionada === 1) {
            if(valor === "Vidro incolor com acabamento fosco (cor original do alumínio)"){
                valorDinheiro = 400;
            }
            // ... mais sub-opções
        }
```

**Esta é a correção principal!**

- Primeiro verificamos `opcaoSelecionada` (qual categoria principal o usuário escolheu).
- Só depois verificamos qual subtipo foi selecionado.
- Isso **resolve o bug** onde "sem película" e "com película" tinham sub-opções com o mesmo nome. Agora cada categoria tem seus próprios preços.

**Como ler os preços:**
- `valorDinheiro = 400` → Significa R$ 400,00 por metro quadrado.
- A fórmula final será: `altura × largura × 400 = valor total`.
- Exemplo: um vidro de 2m × 1,5m = 3 m² × R$400 = **R$ 1.200,00**.

---

### 🟢 Parte 5 — A Formatação Automática com Vírgula

```javascript
function formatarMetros(input) {
    let valor = input.value.replace(/\D/g, "");
```

- `input.value` → Pega o que o usuário digitou no campo.
- `.replace(/\D/g, "")` → **Remove tudo que não é número**. Se o usuário digitar `2,5a`, fica `25`. Isso garante que só dígitos puros restam.

```javascript
    valor = valor.replace(/^0+/, "") || "0";
```

- Remove zeros extras no início. Ex: `0025` vira `25`. Se ficar vazio, coloca pelo menos `"0"`.

```javascript
    while (valor.length < 3) {
        valor = "0" + valor;
    }
```

- Se o número tiver menos de 3 dígitos, adiciona zeros na frente. Ex: `5` → `005`, `25` → `025`. Isso é necessário para que a vírgula fique no lugar certo.

```javascript
    const inteiro = valor.slice(0, -2);
    const decimal = valor.slice(-2);
    input.value = inteiro + "," + decimal;
}
```

- **Separa** o número em duas partes: tudo antes dos 2 últimos dígitos (parte inteira) e os 2 últimos dígitos (parte decimal).
- Exemplo: `"150"` → inteiro = `"1"`, decimal = `"50"` → resultado = `"1,50"`.
- Exemplo: `"005"` → inteiro = `"0"`, decimal = `"05"` → resultado = `"0,05"`.

> 💡 **Resumindo:** o usuário só digita números e a vírgula aparece sozinha. Digitar `200` mostra `2,00`. Digitar `150` mostra `1,50`.

---

### 🟢 Parte 6 — Convertendo o texto de volta para número

```javascript
function parseMetros(valor) {
    if (!valor || valor.trim() === "") return NaN;
    return parseFloat(valor.replace(",", "."));
}
```

- Na hora de calcular, o campo mostra `"1,50"` (texto). Mas para fazer conta matemática, precisamos do número `1.5`.
- `valor.replace(",", ".")` → Troca a vírgula por ponto: `"1,50"` → `"1.50"`.
- `parseFloat(...)` → Converte o texto `"1.50"` no número `1.5`.
- Se estiver vazio, retorna `NaN` (que significa "não é um número"), e o código depois avisa o usuário para preencher.

---

### 🟢 Parte 7 — Os "ouvintes" de digitação

```javascript
const alturaInput = document.getElementById("Altura");
const larguraInput = document.getElementById("Largura");

if (alturaInput) {
    alturaInput.addEventListener("input", function() {
        formatarMetros(this);
    });
}
```

- Encontra os campos de Altura e Largura na página.
- `addEventListener("input", ...)` → *"Cada vez que o usuário digitar algo neste campo, rode a função `formatarMetros`."*
- Ou seja: **a cada tecla pressionada**, o valor é reformatado com a vírgula no lugar certo.

---

### 🟢 Parte 8 — O botão "Calcular Orçamento"

```javascript
function calcular() {
    const altura = parseMetros(document.getElementById("Altura").value);
    const largura = parseMetros(document.getElementById("Largura").value);
```

- Pega os valores dos campos e converte para números (usando a função que explicamos acima).

```javascript
    if (isNaN(altura) || isNaN(largura) || altura <= 0 || largura <= 0) {
        alert("Preencha altura e largura corretamente");
        return;
    }
```

- **Verificação de segurança:** se o usuário não preencheu corretamente, mostra um aviso e **para por aqui** (`return` = "pare, não continue").
- `isNaN(altura)` → *"A altura não é um número?"*
- `||` → Significa "ou". Se **qualquer uma** das condições for verdadeira, mostra o alerta.

```javascript
    const resultado = (altura * largura) * valorDinheiro;
```

- **A conta principal!**
  - `altura * largura` → Calcula a **área em metros quadrados**.
  - `× valorDinheiro` → Multiplica pela tabela de preço por m².
  - Exemplo: 2m × 1,5m × R$400/m² = **R$ 1.200,00**.

```javascript
    abrirTela(resultado, altura, largura, valorDinheiro, opcoes, subOpcoes);
```

- Chama a função que abre a tela de resumo, passando todos os dados calculados.

---

### 🟢 Parte 9 — A tela de resumo do orçamento

```javascript
function abrirTela(valor, altura, largura, valorDinheiro, opcoes, subOpcoes) {
    document.getElementById("valorFinal").innerText = `R$ ${valor.toFixed(2)}`;
```

- Mostra o valor total formatado. `.toFixed(2)` garante que sempre tenha 2 casas decimais (ex: `1200.00`).

```javascript
    const alturaFormatada = altura.toFixed(2).replace(".", ",");
    const larguraFormatada = largura.toFixed(2).replace(".", ",");
```

- Converte os números para texto no formato brasileiro: `1.50` → `1,50`.

```javascript
    document.getElementById("resAltura").innerText = `${alturaFormatada} m`;
    document.getElementById("resLargura").innerText = `${larguraFormatada} m`;
```

- Mostra as medidas no resumo com "m" ao lado (ex: `1,50 m`).

---

### 🟢 Parte 10 — A mensagem do WhatsApp

```javascript
    const mensagem = `Olá! Acabei de fazer um orçamento pelo site e gostaria de dar continuidade.

Dados do orçamento:
- Altura: ${alturaFormatada} m
- Largura: ${larguraFormatada} m
- Tipo: ${opcoes} 
- Subtipo: ${subOpcoes}

- Valor Total: R$ ${valor.toFixed(2)}

Poderia me confirmar os detalhes, prazo e forma de pagamento?`;
```

- Monta uma mensagem pré-escrita com todos os dados do orçamento.
- Os `${...}` são espaços onde o código insere os valores automaticamente.

```javascript
    const link = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    document.getElementById("btnWhats").href = link;
```

- Cria um link do WhatsApp com a mensagem já preenchida.
- `encodeURIComponent(mensagem)` → Converte a mensagem para um formato que funciona em links (troca espaços, acentos, etc).
- Coloca esse link no botão "Entrar em contato".

```javascript
    document.getElementById("overlay").style.display = "flex";
```

- **Mostra a tela de resumo** (que antes estava escondida).

---

### 🟢 Parte 11 — Fechar e Limpar

```javascript
function fecharTela() {
    document.getElementById("overlay").style.display = "none";
}
```

- Esconde a tela de resumo.

```javascript
function limparCampos() {
    document.getElementById("Altura").value = "";
    document.getElementById("Largura").value = "";
    limparSubopcoes();
    document.getElementById("subOpcoes").selectedIndex = 0;
    document.getElementById("opcoes").selectedIndex = 0;
    document.getElementById("resultado").innerText = "R$ —";
}
```

- Limpa **todos os campos** e volta tudo ao estado inicial, como se a página tivesse acabado de abrir.

---

## 📁 Arquivos Modificados

| Arquivo | O que mudou |
|---|---|
| `orcamento.html` | Labels de centímetros → metros, campos de input mudados para texto com vírgula, removida exibição do valor por cm² |
| `script.js` | Preços corrigidos para metro quadrado, formatação automática com vírgula, bug de categorias duplicadas corrigido |

---

> 📌 **Nota importante:** O documento de referência lista `4.500,00` para "Vidro incolor com acabamento com cor" na categoria **com película**. No código foi usado `450,00` por parecer ser um erro de digitação. Se realmente for R$ 4.500,00, é necessário ajustar manualmente no código (linha 81 do `script.js`, trocar `450` por `4500`).
