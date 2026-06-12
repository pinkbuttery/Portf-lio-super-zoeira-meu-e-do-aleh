// Configurações iniciais
let currentRow = 0;
let currentCol = 0;
let jogoTerminado = false; // Flag para controlar o fim do jogo

// Dicionário de palavras
const listaDePalavras = ["TERMO", "CASAS", "LIVRO", "CARRO", "MUNDO", "PIANO", "FLOR", "RITMO", "JOGOS"];

// Sorteia uma palavra ao carregar o jogo
let palavraSecreta = listaDePalavras[Math.floor(Math.random() * listaDePalavras.length)];

// Função principal de entrada
function handleKey(key) {
    if (jogoTerminado) return; // Se o jogo acabou, ignora novos cliques

    if (key === 'ENTER') {
        validateWord();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else {
        insertLetter(key);
    }
}

// Inserir letra
function insertLetter(letter) {
    if (currentCol < 5) {
        const cell = document.getElementById(`cell-${currentRow}-${currentCol}`);
        cell.textContent = letter;
        currentCol++;
    }
}

// Apagar letra
function deleteLetter() {
    if (currentCol > 0) {
        currentCol--;
        const cell = document.getElementById(`cell-${currentRow}-${currentCol}`);
        cell.textContent = '';
    }
}

// Validação da palavra
function validateWord() {
    if (currentCol !== 5) {
        alert("A palavra precisa ter 5 letras!");
        return;
    }

    // Coletar tentativa para comparar
    let tentativa = "";
    for (let i = 0; i < 5; i++) {
        tentativa += document.getElementById(`cell-${currentRow}-${i}`).textContent;
    }

    // Aplicar lógica de cores
    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${currentRow}-${i}`);
        const letter = tentativa[i];

        if (letter === palavraSecreta[i]) {
            cell.classList.add('correct');
        } else if (palavraSecreta.includes(letter)) {
            cell.classList.add('present');
        } else {
            cell.classList.add('absent');
        }
    }

    // Verifica vitória
    if (tentativa === palavraSecreta) {
        jogoTerminado = true;
        setTimeout(() => {
            window.location.href = "win.html";
        }, 1000); 
    } 
    // Verifica derrota (6 tentativas esgotadas: linha 0 a 5)
    else if (currentRow >= 5) {
        jogoTerminado = true;
        setTimeout(() => {
            window.location.href = "loss.html";
        }, 1000);
    } 
    // Próxima rodada
    else {
        currentRow++;
        currentCol = 0;
    }
} // <--- Fechamento da função validateWord adicionado aqui

// Suporte ao teclado físico
document.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
        handleKey(key);
    } else if (key === 'ENTER') {
        handleKey('ENTER');
    } else if (key === 'BACKSPACE') {
        handleKey('BACKSPACE');
    }
});