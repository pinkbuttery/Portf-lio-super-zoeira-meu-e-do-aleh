// ==========================================
// 1. BANCO DE DADOS DOS ITENS (SINCRO COM O SEU NOVO CAMINHO)
// ==========================================
const ITENS_STATUS = {
    espada: { nome: "Espada Curta", dano: 12, escudo: 0, sprite: "../img/itens/espada.png" },
    escudo: { nome: "Escudo de Madeira", dano: 0, escudo: 15, sprite: "../img/itens/escudo.png" },
    pocao:  { nome: "Poção de Vida", cura: 25, sprite: "../img/itens/pocao.png" }
};

// ==========================================
// 2. STATUS DOS COMBATENTES
// ==========================================
let heroi = {
    vidaMax: 100,
    vida: 100,
    escudo: 0,
    itens: []
};

let inimigo = {
    nome: "Goblin da Taverna",
    vidaMax: 80,
    vida: 80,
    escudo: 0,
    danoBase: 8
};

let loopCombate;
let tempo = 0;

// ==========================================
// 3. INICIALIZAÇÃO DA BATALHA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    carregarMochilaDoJogador();
    aplicarItensIniciais();
    atualizarBarrasDeVida();
    
    setTimeout(iniciarLoopCombate, 1500);
});

function carregarMochilaDoJogador() {
    const mochilaSalva = localStorage.getItem("mochilaJogador");
    if (mochilaSalva) {
        heroi.itens = JSON.parse(mochilaSalva);
    }

    const areaMochila = document.querySelector("#jogador .mochila-combate");
    if (areaMochila && heroi.itens.length > 0) {
        areaMochila.innerHTML = ""; // Limpa os exemplos
        
        heroi.itens.forEach(idItem => {
            const itemInfo = ITENS_STATUS[idItem];
            if (itemInfo) {
                const itemDiv = document.createElement("div");
                itemDiv.className = "item-ativo";
                
                // Agora criamos uma tag de imagem com o sprite correto!
                const imgSprite = document.createElement("img");
                imgSprite.src = itemInfo.sprite;
                imgSprite.alt = itemInfo.nome;
                imgSprite.style.width = "100%";
                imgSprite.style.height = "100%";
                imgSprite.style.objectFit = "contain";
                
                itemDiv.appendChild(imgSprite);
                areaMochila.appendChild(itemDiv);
            }
        });
    }
}

function aplicarItensIniciais() {
    heroi.itens.forEach(idItem => {
        const item = ITENS_STATUS[idItem];
        if (item && item.escudo > 0) {
            heroi.escudo += item.escudo;
        }
    });
}

// ==========================================
// 4. CÁLCULO DOS TURNOS (A LUTA AUTOMÁTICA)
// ==========================================
function iniciarLoopCombate() {
    adicionarLog("⚔️ O combate começou!");
    
    loopCombate = setInterval(() => {
        tempo++;
        document.getElementById("tempo-decorrido").innerText = `00:${tempo < 10 ? '0' + tempo : tempo}`;

        // ---- TURNO DO JOGADOR ----
        let danoTotalJogador = 0;
        
        // Copiamos a lista para evitar bugs ao remover a poção durante o loop
        let itensAtuais = [...heroi.itens];

        itensAtuais.forEach(idItem => {
            const item = ITENS_STATUS[idItem];
            if (item && item.dano > 0) {
                danoTotalJogador += item.dano;
            }
            if (item && item.cura > 0 && heroi.vida < heroi.vidaMax * 0.4) {
                heroi.vida = Math.min(heroi.vidaMax, heroi.vida + item.cura);
                adicionarLog(`🧪 Você usou uma ${item.nome} e curou +${item.cura} de Vida!`);
                
                // Remove a poção do herói para não usar infinitamente
                const index = heroi.itens.indexOf(idItem);
                if (index > -1) heroi.itens.splice(index, 1);
            }
        });

        if (danoTotalJogador > 0) {
            inimigo.vida -= danoTotalJogador;
            adicionarLog(`💥 Você atacou o inimigo causando ${danoTotalJogador} de dano.`);
        } else {
            inimigo.vida -= 2;
            adicionarLog(`👊 Sem armas prontas, você deu um soco de 2 de dano.`);
        }

        // ---- TURNO DO INIMIGO ----
        let danoDoInimigo = inimigo.danoBase;
        
        if (heroi.escudo > 0) {
            if (heroi.escudo >= danoDoInimigo) {
                heroi.escudo -= danoDoInimigo;
                adicionarLog(`🛡️ Seu escudo absorveu todo o ataque do inimigo.`);
                danoDoInimigo = 0;
            } else {
                danoDoInimigo -= heroi.escudo;
                adicionarLog(`🛡️ Seu escudo quebrou! Absorveu ${heroi.escudo} de dano.`);
                heroi.escudo = 0;
            }
        }

        if (danoDoInimigo > 0) {
            heroi.vida -= danoDoInimigo;
            adicionarLog(`👹 O inimigo te acertou causando ${danoDoInimigo} de dano.`);
        }

        atualizarBarrasDeVida();
        verificarFimDeJogo();

    }, 1000);
}

// ==========================================
// 5. FUNÇÕES AUXILIARES DA INTERFACE
// ==========================================
function atualizarBarrasDeVida() {
    const vJogador = Math.max(0, heroi.vida);
    const vInimigo = Math.max(0, inimigo.vida);

    document.getElementById("vida-jogador").style.width = `${(vJogador / heroi.vidaMax) * 100}%`;
    document.getElementById("vida-inimigo").style.width = `${(vInimigo / inimigo.vidaMax) * 100}%`;

    document.querySelector("#jogador .texto-vida").innerText = `${vJogador} / ${heroi.vidaMax} ❤️ (Shield: ${heroi.escudo})`;
    document.querySelector("#inimigo .texto-vida").innerText = `${vInimigo} / ${inimigo.vidaMax} ❤️`;
}

function adicionarLog(texto) {
    const lista = document.getElementById("lista-eventos");
    if (!lista) return;
    
    const p = document.createElement("p");
    p.className = "evento";
    p.innerText = texto;
    lista.appendChild(p);
    lista.scrollTop = lista.scrollHeight;
}

function verificarFimDeJogo() {
    const btnVoltar = document.getElementById("btn-voltar");

    if (inimigo.vida <= 0 || heroi.vida <= 0) {
        clearInterval(loopCombate);
        btnVoltar.disabled = false;
        
        if (inimigo.vida <= 0 && heroi.vida > 0) {
            adicionarLog("🏆 SENSACIONAL! Você venceu o combate!");
            btnVoltar.innerText = "COLETAR RECOMPENSA (Vitória)";
            btnVoltar.style.backgroundColor = "#2ecc71";
            btnVoltar.style.cursor = "pointer";
            btnVoltar.onclick = () => window.location.href = "vitoria.html";
        } else {
            adicionarLog("💀 TRISTEZA! Você foi derrotado...");
            btnVoltar.innerText = "VER DESTINO (Derrota)";
            btnVoltar.style.backgroundColor = "#e74c3c";
            btnVoltar.style.cursor = "pointer";
            btnVoltar.onclick = () => window.location.href = "derrota.html";
        }
    }
}