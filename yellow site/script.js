// 1. Centraliza as listas de imagens de cada carrossel com os caminhos atualizados
const carrosseis = {
    "carousel-1": [
        "./source/img/carrosel1/img1.webp",
        "./source/img/carrosel1/img2.webp",
        "./source/img/carrosel1/img3.webp"
    ],
    "carousel-2": [
        "./source/img/carrosel2/img1.webp",
        "./source/img/carrosel2/img2.webp",
        "./source/img/carrosel2/img3.webp"
    ],
    "carousel-3": [
        "./source/img/carrosel3/img1.webp",
        "./source/img/carrosel3/img2.webp",
        "./source/img/carrosel3/img3.webp"
    ],
    "carousel-4": [
        "./source/img/carrosel4/img1.avif",
        "./source/img/carrosel4/img2.avif",
        "./source/img/carrosel4/img3.avif"
    ]
};

// 2. Guarda o índice atual de cada carrossel de forma independente
const indicesAtuais = {
    "carousel-1": 0,
    "carousel-2": 0,
    "carousel-3": 0,
    "carousel-4": 0
};

// 3. Função que faz a mudança das fotos usando o ID do carrossel
function mudarFoto(direcao, idCarrossel) {
    const listaImagens = carrosseis[idCarrossel];
    
    // Garante que o carrossel existe no nosso objeto acima
    if (!listaImagens) return;

    // Atualiza o índice específico daquele carrossel
    indicesAtuais[idCarrossel] += direcao;

    // Efeito infinito (ir para o final ou voltar para o começo)
    if (indicesAtuais[idCarrossel] >= listaImagens.length) {
        indicesAtuais[idCarrossel] = 0;
    }
    if (indicesAtuais[idCarrossel] < 0) {
        indicesAtuais[idCarrossel] = listaImagens.length - 1;
    }

    // Busca a tag <img> de dentro daquele carrossel específico
    const container = document.getElementById(idCarrossel);
    const tagImg = container.querySelector(".carousel-view img");

    if (tagImg) {
        // Altera a imagem correspondente
        tagImg.src = listaImagens[indicesAtuais[idCarrossel]];
    }
}

// Função para abrir e fechar a janela de chat mudando a classe CSS
function alternarChat() {
    const janelaChat = document.getElementById("chat-window");
    janelaChat.classList.toggle("chat-hidden");
}

// Envia a mensagem do usuário e simula uma resposta fake do sistema
function enviarMensagemFake() {
    const input = document.getElementById("chat-input");
    const mensagemTexto = input.value.trim();

    // Se o campo estiver em branco, ignora
    if (mensagemTexto === "") return;

    const corpoChat = document.getElementById("chat-body");

    // 1. Cria a bolha da mensagem do Usuário
    const bolhaUsuario = document.createElement("div");
    bolhaUsuario.classList.add("chat-message", "user-message");
    bolhaUsuario.innerText = mensagemTexto;
    corpoChat.appendChild(bolhaUsuario);

    // Limpa o campo de texto
    input.value = "";

    // Rola o chat automaticamente para a última mensagem
    corpoChat.scrollTop = corpoChat.scrollHeight;

    // 2. Simula uma resposta automática do robô após 1 segundo
    setTimeout(() => {
        const bolhaBot = document.createElement("div");
        bolhaBot.classList.add("chat-message", "bot-message");
        bolhaBot.innerText = "Entendi! Esse é um teste da nossa interface. Em breve nosso sistema inteligente estará 100% ativo! 😉";
        corpoChat.appendChild(bolhaBot);
        
        // Rola novamente para baixo
        corpoChat.scrollTop = corpoChat.scrollHeight;
    }, 1000);
}

// Permite enviar a mensagem apertando a tecla 'Enter' do teclado
function verificarEnter(event) {
    if (event.key === "Enter") {
        enviarMensagemFake();
    }
}