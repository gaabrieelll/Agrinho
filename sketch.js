let cards = [];
let flipped = [];
let matched = [];
let questions = [
    // Cada pergunta agora tem um 'answerEmoji' (para a carta) e um 'expectedTextAnswer' (para a digitação do usuário)
    { topic: "campo", question: "Qual animal é pequeno e faz 'mééé'?", answerEmoji: "🐑", expectedTextAnswer: "ovelha" },
    { topic: "cidade", question: "Onde muitas pessoas trabalham em escritórios altos?", answerEmoji: "🏢", expectedTextAnswer: "predio" },
    { topic: "campo", question: "Qual máquina ajuda a colher plantações?", answerEmoji: "🚜", expectedTextAnswer: "trator" },
    { topic: "cidade", question: "Qual veículo com trilhos transporta muitas pessoas rapidamente?", answerEmoji: "🚆", expectedTextAnswer: "trem" },
    { topic: "campo", question: "Qual ave de fazenda põe ovos?", answerEmoji: "🐔", expectedTextAnswer: "galinha" },
    { topic: "cidade", question: "Qual local tem muitos livros para as pessoas lerem e estudarem?", answerEmoji: "📚", expectedTextAnswer: "biblioteca" },
    { topic: "campo", question: "Qual construção rural é usada para guardar feno e animais?", answerEmoji: "🏘️", expectedTextAnswer: "celeiro" },
    { topic: "campo", question: "O que cobrem as áreas rurais, geralmente verdes e extensas?", answerEmoji: "🏞️", expectedTextAnswer: "pasto" },
    { topic: "cidade", question: "Qual é uma via movimentada onde carros e ônibus circulam?", answerEmoji: "🛣️", expectedTextAnswer: "rua" },
    { topic: "cidade", question: "Qual é o principal local de compras com muitas lojas?", answerEmoji: "🛍️", expectedTextAnswer: "shopping" }
];
let currentQuestion = null;
let userAnswer = '';
let waitingAnswer = false;
let score = 0;

// Não precisamos mais da função preload() pois não estamos carregando imagens.
// function preload() {
//     for (let question of questions) {
//         // Carrega a imagem. O nome do arquivo deve ser igual ao 'answer' + '.png'
//         // Por exemplo, se answer é "vaca", ele tenta carregar "vaca.png"
//         // Certifique-se de que seus arquivos de imagem NÃO tenham acentos para evitar erros de carregamento!
//         question.img = loadImage(`${question.answer}.png`, 
//             // Callback de sucesso para depuração (opcional)
//             () => console.log(`Imagem ${question.answer}.png carregada com sucesso.`),
//             // Callback de erro para depuração (MUITO útil!)
//             (err) => console.error(`Erro ao carregar imagem ${question.answer}.png:`, err)
//         ); 
//     }
// }

function setup() {
    // Cria o canvas onde o jogo será desenhado
    createCanvas(800, 600); 

    // Valores das cartas (agora são os emojis correspondentes)
    // Mapeamos os 'answerEmoji' das perguntas para criar a lista de valores das cartas
    let values = questions.map(q => q.answerEmoji);
    values = values.concat(values); // Duplica os valores para criar os pares
    values = shuffle(values); // Embaralha a ordem das cartas

    // Configurações de layout das cartas
    let cardWidth = 100;
    let cardHeight = 120;
    let paddingX = 20; // Espaçamento horizontal entre as cartas
    let paddingY = 20; // Espaçamento vertical entre as cartas
    let startX = 50; // Posição X inicial para a primeira carta
    let startY = 50; // Posição Y inicial para a primeira carta
    let cardsPerRow = 5; // Número de cartas por linha

    // Cria as 20 cartas e as posiciona no canvas
    for (let i = 0; i < 20; i++) {
        let col = i % cardsPerRow; // Coluna atual
        let row = floor(i / cardsPerRow); // Linha atual
        let x = startX + col * (cardWidth + paddingX);
        let y = startY + row * (cardHeight + paddingY);
        let value = values[i]; // O emoji da carta
        
        // Adiciona a nova carta ao array 'cards'
        // A carta agora só precisa do valor do emoji para se mostrar
        cards.push(new Card(x, y, value, cardWidth, cardHeight));
    }
    textFont('Arial'); // Define a fonte para o texto (pontuação, perguntas)
    textAlign(CENTER, CENTER); // Alinha o texto ao centro por padrão
}

function draw() {
    background(240); // Cor de fundo do canvas

    // Desenha todas as cartas
    for (let card of cards) {
        card.show();
    }

    // Exibe a pontuação
    fill(0); // Cor do texto
    textSize(20);
    textAlign(LEFT, TOP); // Alinha o texto da pontuação à esquerda e topo
    text(`Pontos: ${score}`, 10, 30);

    // Se estiver esperando uma resposta para a pergunta
    if (waitingAnswer && currentQuestion) {
        // Fundo semi-transparente para o pop-up da pergunta
        fill(0, 0, 0, 180); 
        rect(width / 2 - 250, height / 2 - 80, 500, 160, 15); // Pop-up centralizado com bordas arredondadas
        
        // Texto da pergunta
        fill(255); 
        textSize(20);
        textAlign(CENTER, TOP); 
        text(currentQuestion.question, width / 2, height / 2 - 60);
        
        // Instrução para o usuário
        textSize(16);
        text("Digite sua resposta e aperte ENTER:", width / 2, height / 2 - 20);
        
        // Campo de entrada visual para a resposta do usuário
        fill(200); 
        rect(width / 2 - 150, height / 2 + 10, 300, 30, 5);
        
        // Exibe o que o usuário está digitando
        fill(0); 
        textAlign(CENTER, CENTER);
        text(userAnswer, width / 2, height / 2 + 25);
    }
}

function mousePressed() {
    // Não permite cliques se estiver esperando uma resposta
    if (waitingAnswer) return; 
    
    // Itera sobre todas as cartas para verificar se alguma foi clicada
    for (let card of cards) {
        // Verifica se a carta não está virada, não foi combinada e o clique foi dentro dela
        if (!card.flipped && !card.matched && card.contains(mouseX, mouseY)) {
            // Permite virar no máximo duas cartas
            if (flipped.length < 2) {
                card.flip(); // Vira a carta
                flipped.push(card); // Adiciona a carta ao array de cartas viradas

                // Se duas cartas foram viradas
                if (flipped.length === 2) {
                    // Verifica se as cartas formam um par (comparando os emojis)
                    if (flipped[0].value === flipped[1].value) {
                        flipped[0].matched = true; // Marca a primeira carta como combinada
                        flipped[1].matched = true; // Marca a segunda carta como combinada
                        matched.push(flipped[0].value); // Adiciona o valor ao array de combinadas
                        
                        // Encontra a pergunta correspondente ao par, usando o 'answerEmoji'
                        currentQuestion = questions.find(q => q.answerEmoji === flipped[0].value);
                        
                        // Se houver uma pergunta, ativa o modo de espera por resposta
                        if (currentQuestion) {
                            waitingAnswer = true; 
                        } else {
                            // Se não houver pergunta (improvável com a sua lógica, mas para segurança),
                            // limpa as cartas viradas após um pequeno atraso
                            setTimeout(() => {
                                flipped = [];
                            }, 800);
                        }
                    } else {
                        // Se não for um par, vira as cartas de volta após um atraso para o usuário ver
                        setTimeout(() => {
                            flipped[0].flip(); 
                            flipped[1].flip(); 
                            flipped = []; // Limpa as cartas viradas
                        }, 1000); 
                    }
                }
            }
        }
    }
}

function keyPressed() {
    // Só processa teclas se estiver esperando por uma resposta
    if (!waitingAnswer) return;

    if (keyCode === ENTER) {
        // Se a resposta estiver correta (ignorando maiúsculas/minúsculas e espaços extras)
        // A comparação agora é feita com 'expectedTextAnswer'
        if (currentQuestion && userAnswer.toLowerCase().trim() === currentQuestion.expectedTextAnswer) {
            score += 10; // Adiciona pontos
        }
        // Reseta o estado da pergunta e entrada do usuário
        userAnswer = '';
        currentQuestion = null;
        waitingAnswer = false;
        flipped = []; // Limpa as cartas viradas (mesmo se a resposta estiver errada, elas já foram comparadas)
    } else if (keyCode === BACKSPACE) {
        // Apaga o último caractere da resposta do usuário
        userAnswer = userAnswer.slice(0, -1);
    } else if (key.length === 1) { 
        // Adiciona o caractere digitado à resposta
        userAnswer += key;
    }
}

// Definição da classe Card para representar cada carta do jogo
class Card {
    // O construtor recebe o valor (emoji)
    constructor(x, y, value, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.value = value; // O valor da carta (o emoji)
        this.flipped = false; // Estado: virada para cima ou para baixo
        this.matched = false; // Estado: se já foi combinada
    }

    show() {
        stroke(0); // Borda da carta
        if (this.flipped || this.matched) {
            fill(100, 200, 150); // Cor de fundo da carta virada
            rect(this.x, this.y, this.w, this.h, 10); // Desenha o retângulo da carta
            
            // Desenha o emoji
            textSize(this.h * 0.7); // Ajusta o tamanho do emoji para caber na carta
            textAlign(CENTER, CENTER);
            text(this.value, this.x + this.w / 2, this.y + this.h / 2 + 5); // Centraliza o emoji
        } else {
            fill(180); // Cor de fundo da carta virada para baixo
            rect(this.x, this.y, this.w, this.h, 10); // Desenha o retângulo da carta
            fill(50); // Cor do ponto de interrogação
            textSize(30);
            text('?', this.x + this.w / 2, this.y + this.h / 2); // Desenha o ponto de interrogação
        }
    }

    // Verifica se as coordenadas do mouse (px, py) estão dentro da carta
    contains(px, py) {
        return px > this.x && px < this.x + this.w && py > this.y && py < this.y + this.h;
    }

    // Alterna o estado 'flipped' da carta
    flip() {
        this.flipped = !this.flipped;
    }
}

// Função auxiliar para embaralhar um array (algoritmo Fisher-Yates)
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = floor(random(currentIndex));
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}