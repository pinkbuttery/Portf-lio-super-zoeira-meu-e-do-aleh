// ==========================================
// 1. BANCO DE DADOS DOS ITENS (COM MATRIZ DE TAMANHO)
// ==========================================
const ITENS_DATA = {
    espada: { 
        id: "espada", 
        nome: "Espada Curta", 
        sprite: "../img/itens/espada.png", 
        custo: 3,
        largura: 1,  
        altura: 3,   
        classeTamanho: "tamanho-1x3" 
    },
    escudo: { 
        id: "escudo", 
        nome: "Escudo de Madeira", 
        sprite: "../img/itens/escudo.png", 
        custo: 3,
        largura: 2, 
        altura: 2,  
        classeTamanho: "tamanho-2x2"
    },
    pocao: { 
        id: "pocao", 
        nome: "Poção de Vida", 
        sprite: "../img/itens/pocao.png", 
        custo: 2,
        largura: 1, 
        altura: 1,
        classeTamanho: "tamanho-1x1"
    },
    machado: { 
        id: "machado", 
        nome: "Machado de Batalha", 
        sprite: "../img/itens/machado_aco.png", 
        custo: 4,
        largura: 3, 
        altura: 3,  
        formato: [
            [1, 1, 1], // Cabeça do machado
            [0, 1, 0], // Meio do cabo
            [0, 1, 0]  // Fim do cabo
        ],
        classeTamanho: "tamanho-3x3" 
    }
};

// Configurações da nossa grade (6 linhas x 6 colunas)
const TOTAL_LINHAS = 6;   
const TOTAL_COLUNAS = 6;  

// Variável de controle do ouro (que estava faltando!)
let ouro = 10; 

// Cria um mapa mental da mochila para o JavaScript saber o que está livre (0) ou ocupado (1)
let matrizMochila = Array(TOTAL_LINHAS).fill().map(() => Array(TOTAL_COLUNAS).fill(0));

// ==========================================
// 3. FUNÇÕES DE INICIALIZAÇÃO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    atualizarInterface();
    renderizarLoja();
    configurarMochilaDragDrop();
    configurarBotaoBatalha();
});

function atualizarInterface() {
    const elementoOuro = document.getElementById("ouro");
    if (elementoOuro) elementoOuro.textContent = ouro;
}

function renderizarLoja() {
    const vitrine = document.getElementById("vitrine-loja");
    if (!vitrine) return;
    
    vitrine.innerHTML = ""; // Limpa a vitrine antes de desenhar

    // Esse loop passa por CADA item que criamos ali no ITENS_DATA
    for (let chave in ITENS_DATA) {
        const item = ITENS_DATA[chave];
        
        const itemDiv = document.createElement("div");
        itemDiv.className = "item-loja";
        itemDiv.setAttribute("draggable", "true");
        itemDiv.id = item.id;

        const imgSprite = document.createElement("img");
        imgSprite.src = item.sprite;
        imgSprite.alt = item.nome;
        imgSprite.className = "item-sprite";

        const infoTexto = document.createElement("div");
        infoTexto.className = "item-info-texto";
        infoTexto.innerHTML = `<strong>${item.nome}</strong><br><small>Custo: ${item.custo}💰</small>`;

        itemDiv.appendChild(imgSprite);
        itemDiv.appendChild(infoTexto);
        
        // Ativa o evento de arrastar
        itemDiv.addEventListener("dragstart", dragStart);
        
        // Coloca o item na vitrine
        vitrine.appendChild(itemDiv);
    }
}

// ==========================================
// 4. LÓGICA DE ARRASTAR E SOLTAR (VALIDAÇÃO DE ESPAÇO)
// ==========================================
function dragStart(evento) {
    evento.dataTransfer.setData("text/plain", evento.target.id);
    evento.dataTransfer.effectAllowed = "move";
}

function configurarMochilaDragDrop() {
    const gridMochila = document.getElementById("mochila-grid");
    if (!gridMochila) return;

    gridMochila.addEventListener("dragover", (evento) => {
        evento.preventDefault();
    });

    gridMochila.addEventListener("drop", dropItem);
}

function dropItem(evento) {
    evento.preventDefault();
    
    const idItem = evento.dataTransfer.getData("text/plain");
    const itemArrastado = document.getElementById(idItem);
    if (!itemArrastado) return;

    const dadosItem = ITENS_DATA[idItem];
    if (!dadosItem) return;

    let slotAlvo = evento.target;
    if (!slotAlvo.classList.contains("slot")) {
        slotAlvo = slotAlvo.closest(".slot");
    }
    if (!slotAlvo) return;

    const linhaInicial = parseInt(slotAlvo.getAttribute("data-linha"));
    const colunaInicial = parseInt(slotAlvo.getAttribute("data-coluna"));

    // 1. VALIDAÇÃO: Cabe na mochila?
    if (linhaInicial + dadosItem.altura > TOTAL_LINHAS || colunaInicial + dadosItem.largura > TOTAL_COLUNAS) {
        alert("O item não cabe nos limites da mochila! 🎒");
        return;
    }

    // 2. VALIDAÇÃO: Espaço ocupado? (Usa formato customizado em matriz se existir, senão usa bloco cheio)
    for (let l = 0; l < dadosItem.altura; l++) {
        for (let c = 0; c < dadosItem.largura; c++) {
            let blocoOcupado = dadosItem.formato ? (dadosItem.formato[l][c] === 1) : true;
            if (blocoOcupado) {
                if (matrizMochila[linhaInicial + l][colunaInicial + c] === 1) {
                    alert("Espaço bloqueado por outro item! 🛑");
                    return;
                }
            }
        }
    }

    // 3. VALIDAÇÃO: Dinheiro?
    if (ouro < dadosItem.custo) {
        alert("Ouro insuficiente! 💸");
        return;
    }

    // ---- COMPRA CONFIRMADA ----
    ouro -= dadosItem.custo;
    atualizarInterface();

    // Registra na matriz lógica os blocos certos
    for (let l = 0; l < dadosItem.altura; l++) {
        for (let c = 0; c < dadosItem.largura; c++) {
            let blocoOcupado = dadosItem.formato ? (dadosItem.formato[l][c] === 1) : true;
            if (blocoOcupado) {
                matrizMochila[linhaInicial + l][colunaInicial + c] = 1;
            }
        }
    }

    const gridMochila = document.getElementById("mochila-grid");
    gridMochila.appendChild(itemArrastado);

    // Reposiciona fisicamente na mochila
    itemArrastado.style.position = "absolute";
    
    // Baseado na sua grade CSS: cada slot de 60px + 4px de gap = 64px de passo
    const tamanhoBloco = 64;
    const paddingGrid = 10;

    itemArrastado.style.top = `${(linhaInicial * tamanhoBloco) + paddingGrid}px`;
    itemArrastado.style.left = `${(colunaInicial * tamanhoBloco) + paddingGrid}px`;

    // Aplica a classe de tamanho da mochila para mudar a dimensão física
    itemArrastado.classList.add(dadosItem.classeTamanho);

    itemArrastado.setAttribute("draggable", "false");
    itemArrastado.style.zIndex = "10";
    itemArrastado.style.margin = "0";
    itemArrastado.style.backgroundColor = "rgba(46, 48, 63, 0.95)"; 
    itemArrastado.style.border = "2px solid #f1c40f"; 
    itemArrastado.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";
    itemArrastado.style.display = "flex";
    itemArrastado.style.justifyContent = "center";
    itemArrastado.style.alignItems = "center";

    const textoCusto = itemArrastado.querySelector(".item-info-texto");
    if (textoCusto) textoCusto.style.display = "none";
}

// ==========================================
// 5. SALVAR ITENS PARA A BATALHA
// ==========================================
function configurarBotaoBatalha() {
    const btnBatalhar = document.getElementById("btn-batalhar");
    if (!btnBatalhar) return;

    btnBatalhar.addEventListener("click", () => {
        let itensComprados = [];
        const itensNaMochila = document.querySelectorAll("#mochila-grid .item-loja");
        itensNaMochila.forEach(item => {
            itensComprados.push(item.id);
        });
        localStorage.setItem("mochilaJogador", JSON.stringify(itensComprados));
    });
}