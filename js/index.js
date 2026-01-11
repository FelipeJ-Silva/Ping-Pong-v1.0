const canvas = document.getElementById("jogo");
const contexto = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const LARGURA_RAQUETE = 18;
const ALTURA_RAQUETE = 120;
const RAIO_BOLA = 12;
const VELOCIDADE_INICIAL_BOLA = 8;
const VELOCIDADE_MAXIMA_BOLA = 40;
const LARGURA_REDE = 5;
const COR_PADRAO = "WHITE";


const jogador = {
    x: 0,
    y: canvas.height / 2 - ALTURA_RAQUETE / 2,
    largura: LARGURA_RAQUETE,
    altura: ALTURA_RAQUETE,
    cor: COR_PADRAO,
    pontuacao: 0
};

const computador = {
    x: canvas.width - LARGURA_RAQUETE,
    y: canvas.height / 2 - ALTURA_RAQUETE / 2,
    largura: LARGURA_RAQUETE,
    altura: ALTURA_RAQUETE,
    cor: COR_PADRAO,
    pontuacao: 0
};

const bola = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    raio: RAIO_BOLA,
    velocidadeX: VELOCIDADE_INICIAL_BOLA,
    velocidadeY: VELOCIDADE_INICIAL_BOLA,
    velocidade: VELOCIDADE_INICIAL_BOLA,
    cor: COR_PADRAO
};

function desenharRetangulo(x, y, largura, altura, cor) {
    contexto.fillStyle = cor;
    contexto.fillRect(x, y, largura, altura);
}

function desenharCirculo(x, y, raio, cor) {
    contexto.fillStyle = cor;
    contexto.beginPath();
    contexto.arc(x, y, raio, 0, Math.PI * 2, false);
    contexto.closePath();
    contexto.fill();
}

function desenharTexto(texto, x, y, cor) {
    contexto.fillStyle = cor;
    contexto.font = `bold 60px "Courier New"`;
    contexto.textAlign = "center";
    contexto.fillText(texto, x, y);
}

function desenharRede() {
    for (let i = 0; i <= canvas.height; i += 15) {
        desenharRetangulo(canvas.width / 2 - LARGURA_REDE / 2, i, LARGURA_REDE, 10, COR_PADRAO);
    }
}

function renderizar() {
    desenharRetangulo(0, 0, canvas.width, canvas.height, "BLACK");

    desenharRede();

    desenharTexto(jogador.pontuacao, canvas.width / 4, canvas.height / 5, "GRAY");
    desenharTexto(computador.pontuacao, (3 * canvas.width) / 4, canvas.height / 5, "GRAY");

    desenharRetangulo(jogador.x, jogador.y, jogador.largura, jogador.altura, jogador.cor);
    desenharRetangulo(computador.x, computador.y, computador.largura, computador.altura, computador.cor);

    desenharCirculo(bola.x, bola.y, bola.raio, bola.cor);
}

// --- Lógica do Jogo ---

// Reinicia a bola ao centro quando alguém marca ponto
function reiniciarBola() {
    bola.x = canvas.width / 2;
    bola.y = canvas.height / 2;

    bola.velocidadeX = -bola.velocidadeX;

    bola.velocidade = VELOCIDADE_INICIAL_BOLA;
}

// Detecta colisão entre a bola e uma raquete
function detectarColisao(b, p) {
    p.topo = p.y;
    p.baixo = p.y + p.altura;
    p.esquerda = p.x;
    p.direita = p.x + p.largura;

    b.topo = b.y - b.raio;
    b.baixo = b.y + b.raio;
    b.esquerda = b.x - b.raio;
    b.direita = b.x + b.raio;

    return (
        b.direita > p.esquerda &&
        b.baixo > p.topo &&
        b.esquerda < p.direita &&
        b.topo < p.baixo
    );
}

// Atualiza a lógica de movimento e regras
function atualizar() {
    bola.x += bola.velocidadeX;
    bola.y += bola.velocidadeY;

    if (bola.y - bola.raio < 0 || bola.y + bola.raio > canvas.height) {
        bola.velocidadeY = -bola.velocidadeY;
    }

    let nivelComputador = 0.1;
    computador.y += (bola.y - (computador.y + computador.altura / 2)) * nivelComputador;

    let usuarioAtual = (bola.x < canvas.width / 2) ? jogador : computador;

    if (detectarColisao(bola, usuarioAtual)) {
        let pontoDeColisao = bola.y - (usuarioAtual.y + usuarioAtual.altura / 2);

        pontoDeColisao = pontoDeColisao / (usuarioAtual.altura / 2);

        let anguloEmRadianos = (Math.PI / 4) * pontoDeColisao;

        let direcao = (bola.x < canvas.width / 2) ? 1 : -1;

        bola.velocidadeX = direcao * bola.velocidade * Math.cos(anguloEmRadianos);
        bola.velocidadeY = bola.velocidade * Math.sin(anguloEmRadianos);

        bola.velocidade += 0.5;
        if (bola.velocidade > VELOCIDADE_MAXIMA_BOLA) {
            bola.velocidade = VELOCIDADE_MAXIMA_BOLA;
        }
    }

    // Verificação de Pontuação
    if (bola.x - bola.raio < 0) {
        computador.pontuacao++;
        reiniciarBola();
    } else if (bola.x + bola.raio > canvas.width) {
        jogador.pontuacao++;
        reiniciarBola();
    }
}

// --- Controle do Jogador ---

canvas.addEventListener("mousemove", moverRaqueteJogador);

function moverRaqueteJogador(evento) {
    let retanguloCanvas = canvas.getBoundingClientRect();

    let mouseY = evento.clientY - retanguloCanvas.top - jogador.altura / 2;

    if (mouseY < 0) {
        jogador.y = 0;
    } else if (mouseY > canvas.height - jogador.altura) {
        jogador.y = canvas.height - jogador.altura;
    } else {
        jogador.y = mouseY;
    }
}

// --- Loop Principal e Ajustes de Janela ---

// Loop do jogo usando requestAnimationFrame
function loopDoJogo() {
    atualizar();
    renderizar();
    requestAnimationFrame(loopDoJogo);
}

// Inicia o jogo
loopDoJogo();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    computador.x = canvas.width - LARGURA_RAQUETE;
    reiniciarBola();
});