// Seleziona il canvas e il pulsante dall'HTML
let canvas = document.getElementById("game-canvas");
let ctx = canvas.getContext("2d");    //Ottiene il contesto 2D per disegnare sul canvas
let playButton = document.getElementById("playButton");

// Dimensione del canvas
let canvasSize = 400;
canvas.width = canvasSize;
canvas.height = canvasSize;

// Variabili di gioco
let gridSize = 10; //dimensione del "pixel"
let gameSpeed = 150; // velocità di aggiornamento in millisecondi: NON MINORE DI 20 velocissima!!
let gridWidth = canvas.width / gridSize; //numero di pixel in orizzontale
let gridHeight = canvas.height / gridSize; //numero di pixel in orizzontale
let snake = [
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
];  //tre segmenti iniziali del serpente posizionati orizzontalmente
// è un'array di oggetti (ogni oggetto contiente due coppie chiave:valore)
let direction = "right"; //direzione corrente
let newDirection = direction;
let food = createFood(); //cibo
let score = 0; //punteggio
let gameLoop=null; //variabile per il ciclo di gioco
let gameOver = false;
// Posizione cibo casuale
function createFood() {
    let foodX, foodY;
    do {
        foodX = Math.floor(Math.random() * gridWidth);
        foodY = Math.floor(Math.random() * gridHeight);
    } while (foodX < 0 || foodX >= gridWidth-1 || foodY < 0 || foodY >= gridHeight-1);
    foodX = Math.min(foodX, gridWidth - 1);
    foodY = Math.min(foodY, gridHeight - 1);
    return { x: foodX, y: foodY };
}
const bgCanvas = document.getElementById("background");
const bgCtx = bgCanvas.getContext("2d");
function createStar() {
    let starX, starY;
    do {
        starX = Math.floor(Math.random() * gridWidth);
        starY = Math.floor(Math.random() * gridHeight);
    } while (starX < 0 || starY < 0 );
    starX = Math.min(starX, bgCtx);
    starY = Math.min(starY,bgCtx);

    bgCtx.fillRect(starX, starY, bgCanvas.width,  bgCanvas.width);
    return { x: starX, y: starY };
}


window.addEventListener("load", function() {
    let star=createStar();
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;

    // Esempio: disegna uno sfondo semplice
    bgCtx.fillStyle = "black";
    for(let  i=0;i<100;i++){
        createStar();
    }
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
});

function speedUp(addSpeed){ //Ogni 4 punti aumenta (tecnicamente diminuisce) del valore passato la velocità del gioco
    if(!gameSpeed<50&& score%4===0 && score !==0){
        gameSpeed-=addSpeed;
        console.log(gameSpeed+"diminuita di "+addSpeed);
        if(gameLoop){
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
    }
}
let id=null;
let isMoving=false;
let pos = 0;
let moveDirection = 1; // 1 = destra, -1 = sinistra
let firstMove = true;
function Move(unitsToMove, elemToMove) {
    if (!isMoving) {
        const elem = document.getElementById(elemToMove);
        pos = parseInt(elem.style.left) || 0;
        let targetPos = pos + (unitsToMove * moveDirection); // Direzione applicata qui
        clearInterval(id);
        id = setInterval(frame, 10);
        function frame() {
            if (pos === targetPos) {
                clearInterval(id);
                isMoving = false;
            } else {
                isMoving = true;
                pos += (2 * moveDirection);
                elem.style.left = pos + 'px';
            }
        }
    }
}
let lastScore;

function CheckForMove(unitsToMove, elemToMove) {
    if (score % 4 === 0 && score !== 0 && lastScore !== score) {
        if(firstMove){
            moveDirection *= -1;
            Move(unitsToMove, elemToMove);
            firstMove = false;
        }else{
            moveDirection *= -1;
            Move(unitsToMove*2, elemToMove);
        }


    }
    lastScore = score;
}

// Update del gioco
function update() {

    let head = { x: snake[0].x, y: snake[0].y }; //posizione attuale testa
    CheckForMove(550,"game-container");
    // Aggiorna la direzione
    if (newDirection) { //se ha un valore valido
        direction = newDirection;  //viene assegnato il valore scelto dall'utente
    }

    // Nuova Posizione della testa in base alla direzione
    if (direction === "up") head.y--;
    else if (direction === "down") head.y++;
    else if (direction === "left") head.x--;
    else if (direction === "right") head.x++;

    // Collisione con i bordi
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        clearInterval(gameLoop);
        drawGameOver();
        gameOver=true;
        return;
    }

    // Collisione con il corpo
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            clearInterval(gameLoop);
            drawGameOver();
            gameOver=true;
            return;
        }
    }

    // Aggiungi la Nuova posizione della testa al serpente
    snake.unshift(head);

    // Controlla se il cibo è stato mangiato
    if (head.x === food.x && head.y === food.y) {
        food = createFood();
        score++;
        speedUp(20);
        checkScoreDifficulty(10);
        console.log("event called");
    } else {
        snake.pop(); // Rimuove la coda
    }
    function checkScoreDifficulty(minusSize){ //Imposta la grandezza dell'area del gioco ogni 3 punti usando SetBorderSize
        if(score%3===0 && score!==0){
            SetBorderSize(-minusSize);
            console.log("canvas size");
        }
    }

    function SetBorderSize(newN) {
        if (newN === 0) {
            canvasSize = 400;
        } else {
            canvasSize += newN;
        }

        // Aggiorna le dimensioni del canvas
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        gridWidth = Math.floor(canvas.width / gridSize);
        gridHeight = Math.floor(canvas.height / gridSize);

        food = createFood();
    }

    // Disegna lo sfondo
    ctx.fillStyle = "#00295B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Disegna il cibo
    ctx.fillStyle = "#f00";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    // Disegna il serpente
    ctx.fillStyle = "#0f0";
    snake.forEach(function (segment) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });

    // Disegna il punteggio
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    ctx.fillText("Score: " + score, 10, 30); //testo, posx e posy
}

// Gestione input da tastiera 
//cambio direzione a meno che non sia la direzione opposta (che auto ucciderebbe il serpente)
function handleInput(event) {
    if (event.keyCode === 38 && direction !== "down") newDirection = "up";
    else if (event.keyCode === 40 && direction !== "up") newDirection = "down";
    else if (event.keyCode === 37 && direction !== "right") newDirection = "left";
    else if (event.keyCode === 39 && direction !== "left") newDirection = "right";
}

//aggiungo il listener sulla tastiera, che esegue handleInput
document.addEventListener("keydown", handleInput);

const audioPlayer = document.getElementById("sound");
function startGame() {
    if (gameLoop===null) { //se il gioco non è ancora avviato
        gameLoop = setInterval(update, gameSpeed);
        audioPlayer.play();
        playButton.style.display = "none";
    }
}

// "Game Over"
function drawGameOver() {
    ctx.fillStyle = "#fff";
    ctx.font = "25px monospace";
    ctx.fillText("Game Over", canvasSize / 2 - 70, canvasSize / 2);
    playButton.textContent = "RESTART";
    gameOver = true;
    audioPlayer.pause();
    playButton.style.display = "block"; //Visualizza il pulsante RESTART
}
function CheckGameState(){
    if(gameOver){
        resetGame();
    }
    startGame();
}
// Reset del gioco
function resetGame() {
    snake = [
        { x: 2, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
    ];
    direction = "down";
    food = createFood();
    clearInterval(gameLoop);
    score = 0;

    gameSpeed = 150;
    gameOver = false;
    canvasSize = 400;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    gridWidth = canvas.width / gridSize;
    gridHeight = canvas.height / gridSize;
    gameLoop = null;
    id = null;
    isMoving = false;
    pos = 0;
    moveDirection = 1;
    firstMove = true;
    lastScore = undefined;
}

// Collega il pulsante all'evento di avvio
playButton.addEventListener("click", CheckGameState);