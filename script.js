// ==========================================
// MAZE MASTER
// Complete Maze Game
// ==========================================

const mazeElement = document.getElementById("maze");
const movesElement = document.getElementById("moves");
const livesElement = document.getElementById("lives");
const timerElement = document.getElementById("timer");
const levelText = document.getElementById("levelText");
const messageElement = document.getElementById("message");

const newMazeButton = document.getElementById("newMaze");
const hintButton = document.getElementById("hintBtn");
const solveButton = document.getElementById("solveBtn");
const difficultySelect = document.getElementById("difficulty");

const winModal = document.getElementById("winModal");
const winText = document.getElementById("winText");
const playAgainButton = document.getElementById("playAgain");
const soundButton = document.getElementById("soundBtn");


// ------------------------------------------
// GAME SETTINGS
// ------------------------------------------

const settings = {
    easy: {
        size: 15,
        lives: 5
    },

    medium: {
        size: 21,
        lives: 3
    },

    hard: {
        size: 31,
        lives: 2
    }
};


// ------------------------------------------
// GAME VARIABLES
// ------------------------------------------

let size = 15;

let maze = [];

let player = {
    row: 1,
    col: 1
};

let start = {
    row: 1,
    col: 1
};

let end = {
    row: 1,
    col: 1
};

let moves = 0;
let lives = 3;
let seconds = 0;

let timer = null;

let gameRunning = false;

let soundOn = true;

let animationRunning = false;


// ------------------------------------------
// SOUND
// ------------------------------------------

let audioContext = null;

function sound(frequency = 400, duration = 0.08) {

    if (!soundOn) return;

    try {

        if (!audioContext) {
            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.frequency.value = frequency;

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        gain.gain.value = 0.05;

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {
        // Sound is optional.
    }
}


// ------------------------------------------
// CREATE MAZE
// ------------------------------------------

function createMaze() {

    maze = [];

    for (let row = 0; row < size; row++) {

        maze[row] = [];

        for (let col = 0; col < size; col++) {

            maze[row][col] = 1;

        }
    }

    // Start maze generation
    carvePath(1, 1);

    start = {
        row: 1,
        col: 1
    };

    end = {
        row: size - 2,
        col: size - 2
    };

    // Make sure destination is open
    maze[end.row][end.col] = 0;

    // Make sure start is open
    maze[start.row][start.col] = 0;

    player = {
        row: start.row,
        col: start.col
    };
}


// ------------------------------------------
// RANDOM MAZE GENERATION
// Recursive Backtracking
// ------------------------------------------

function carvePath(row, col) {

    maze[row][col] = 0;

    const directions = [
        [-2, 0],
        [2, 0],
        [0, -2],
        [0, 2]
    ];

    shuffle(directions);

    for (const [dr, dc] of directions) {

        const newRow = row + dr;
        const newCol = col + dc;

        if (
            newRow > 0 &&
            newRow < size - 1 &&
            newCol > 0 &&
            newCol < size - 1 &&
            maze[newRow][newCol] === 1
        ) {

            maze[row + dr / 2][col + dc / 2] = 0;

            carvePath(newRow, newCol);
        }
    }
}


// ------------------------------------------
// SHUFFLE
// ------------------------------------------

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [array[i], array[j]] =
            [array[j], array[i]];
    }

    return array;
}


// ------------------------------------------
// DRAW MAZE
// ------------------------------------------

function drawMaze(path = [], hint = null) {

    mazeElement.innerHTML = "";

    mazeElement.style.gridTemplateColumns =
        `repeat(${size}, 1fr)`;

    mazeElement.style.gridTemplateRows =
        `repeat(${size}, 1fr)`;

    const pathSet = new Set(
        path.map(cell => `${cell.row},${cell.col}`)
    );

    for (let row = 0; row < size; row++) {

        for (let col = 0; col < size; col++) {

            const cell =
                document.createElement("div");

            cell.classList.add("cell");

            if (maze[row][col] === 1) {
                cell.classList.add("wall");
            }

            if (
                row === start.row &&
                col === start.col
            ) {
                cell.classList.add("start");
            }

            if (
                row === end.row &&
                col === end.col
            ) {
                cell.classList.add("end");
            }

            if (
                row === player.row &&
                col === player.col
            ) {
                cell.classList.add("player");
            }

            if (
                pathSet.has(`${row},${col}`) &&
                !(row === player.row && col === player.col) &&
                !(row === end.row && col === end.col)
            ) {
                cell.classList.add("path");
            }

            if (
                hint &&
                row === hint.row &&
                col === hint.col
            ) {
                cell.classList.add("hint");
            }

            mazeElement.appendChild(cell);
        }
    }
}


// ------------------------------------------
// MOVE PLAYER
// ------------------------------------------

function movePlayer(dr, dc) {

    if (!gameRunning || animationRunning) {
        return;
    }

    const newRow = player.row + dr;
    const newCol = player.col + dc;

    // Outside maze
    if (
        newRow < 0 ||
        newRow >= size ||
        newCol < 0 ||
        newCol >= size
    ) {
        return;
    }

    // Wall
    if (maze[newRow][newCol] === 1) {

        lives--;

        livesElement.textContent = lives;

        messageElement.textContent =
            "💥 You hit a wall!";

        sound(150, 0.12);

        if (lives <= 0) {

            gameOver();

        }

        return;
    }

    player.row = newRow;
    player.col = newCol;

    moves++;

    movesElement.textContent = moves;

    messageElement.textContent =
        "🎮 Keep going! Find the red destination.";

    sound(500, 0.04);

    drawMaze();

    // Check win
    if (
        player.row === end.row &&
        player.col === end.col
    ) {

        winGame();
    }
}


// ------------------------------------------
// KEYBOARD CONTROLS
// ------------------------------------------

document.addEventListener("keydown", event => {

    const key = event.key.toLowerCase();

    if (
        [
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
            "w",
            "a",
            "s",
            "d"
        ].includes(key)
    ) {
        event.preventDefault();
    }

    if (key === "arrowup" || key === "w") {
        movePlayer(-1, 0);
    }

    else if (
        key === "arrowdown" ||
        key === "s"
    ) {
        movePlayer(1, 0);
    }

    else if (
        key === "arrowleft" ||
        key === "a"
    ) {
        movePlayer(0, -1);
    }

    else if (
        key === "arrowright" ||
        key === "d"
    ) {
        movePlayer(0, 1);
    }
});


// ------------------------------------------
// MOBILE CONTROLS
// ------------------------------------------

document
    .querySelectorAll(".mobile-controls button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const key = button.dataset.key;

            if (key === "ArrowUp") {
                movePlayer(-1, 0);
            }

            if (key === "ArrowDown") {
                movePlayer(1, 0);
            }

            if (key === "ArrowLeft") {
                movePlayer(0, -1);
            }

            if (key === "ArrowRight") {
                movePlayer(0, 1);
            }
        });
    });


// ------------------------------------------
// BFS SHORTEST PATH
// ------------------------------------------

function findShortestPath() {

    const queue = [];

    const visited = new Set();

    const parent = new Map();

    const startKey =
        `${player.row},${player.col}`;

    const endKey =
        `${end.row},${end.col}`;

    queue.push({
        row: player.row,
        col: player.col
    });

    visited.add(startKey);

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    while (queue.length > 0) {

        const current = queue.shift();

        const currentKey =
            `${current.row},${current.col}`;

        if (currentKey === endKey) {

            const path = [];

            let key = endKey;

            while (key !== startKey) {

                const [row, col] =
                    key.split(",").map(Number);

                path.push({
                    row,
                    col
                });

                key = parent.get(key);
            }

            path.push({
                row: player.row,
                col: player.col
            });

            path.reverse();

            return path;
        }

        for (const [dr, dc] of directions) {

            const newRow =
                current.row + dr;

            const newCol =
                current.col + dc;

            if (
                newRow < 0 ||
                newRow >= size ||
                newCol < 0 ||
                newCol >= size
            ) {
                continue;
            }

            if (maze[newRow][newCol] === 1) {
                continue;
            }

            const newKey =
                `${newRow},${newCol}`;

            if (!visited.has(newKey)) {

                visited.add(newKey);

                parent.set(
                    newKey,
                    currentKey
                );

                queue.push({
                    row: newRow,
                    col: newCol
                });
            }
        }
    }

    return [];
}


// ------------------------------------------
// HINT
// ------------------------------------------

function showHint() {

    if (!gameRunning || animationRunning) {
        return;
    }

    const path = findShortestPath();

    if (path.length < 2) {
        return;
    }

    const nextStep = path[1];

    drawMaze([], nextStep);

    messageElement.textContent =
        "💡 Purple cell shows your next best move.";

    sound(700, 0.08);

    setTimeout(() => {

        if (gameRunning) {
            drawMaze();
        }

    }, 1200);
}


// ------------------------------------------
// SOLVE MAZE
// ------------------------------------------

async function solveMaze() {

    if (!gameRunning || animationRunning) {
        return;
    }

    const path = findShortestPath();

    if (path.length === 0) {

        messageElement.textContent =
            "❌ No path found.";

        return;
    }

    animationRunning = true;

    messageElement.textContent =
        "🧭 Finding shortest path...";

    drawMaze();

    await sleep(500);

    for (let i = 1; i < path.length; i++) {

        drawMaze(path.slice(0, i + 1));

        await sleep(45);
    }

    messageElement.textContent =
        `🧭 Shortest path found: ${path.length - 1} moves.`;

    sound(800, 0.15);

    animationRunning = false;
}


// ------------------------------------------
// WIN GAME
// ------------------------------------------

function winGame() {

    gameRunning = false;

    clearInterval(timer);

    sound(900, 0.12);

    setTimeout(() => {
        sound(1200, 0.18);
    }, 130);

    winText.innerHTML =
        `You escaped the maze!<br><br>
        👣 Moves: <b>${moves}</b><br>
        ⏱️ Time: <b>${formatTime(seconds)}</b><br>
        ❤️ Lives remaining: <b>${lives}</b>`;

    winModal.classList.remove("hidden");

    messageElement.textContent =
        "🏆 Congratulations! You completed the maze!";
}


// ------------------------------------------
// GAME OVER
// ------------------------------------------

function gameOver() {

    gameRunning = false;

    clearInterval(timer);

    messageElement.textContent =
        "💀 Game Over! Click New Maze to try again.";

    sound(100, 0.4);
}


// ------------------------------------------
// TIMER
// ------------------------------------------

function startTimer() {

    clearInterval(timer);

    timer = setInterval(() => {

        if (!gameRunning) return;

        seconds++;

        timerElement.textContent =
            formatTime(seconds);

    }, 1000);
}


// ------------------------------------------
// FORMAT TIME
// ------------------------------------------

function formatTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const secs =
        totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


// ------------------------------------------
// NEW GAME
// ------------------------------------------

function newGame() {

    const difficulty =
        difficultySelect.value;

    const config =
        settings[difficulty];

    size = config.size;

    lives = config.lives;

    moves = 0;

    seconds = 0;

    animationRunning = false;

    gameRunning = true;

    levelText.textContent =
        difficulty.toUpperCase();

    livesElement.textContent =
        lives;

    movesElement.textContent =
        moves;

    timerElement.textContent =
        "00:00";

    messageElement.textContent =
        "🎮 Reach the red destination!";

    winModal.classList.add("hidden");

    createMaze();

    drawMaze();

    startTimer();

    sound(500, 0.06);
}


// ------------------------------------------
// DELAY FUNCTION
// ------------------------------------------

function sleep(ms) {

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}


// ------------------------------------------
// BUTTON EVENTS
// ------------------------------------------

newMazeButton.addEventListener(
    "click",
    newGame
);

hintButton.addEventListener(
    "click",
    showHint
);

solveButton.addEventListener(
    "click",
    solveMaze
);

playAgainButton.addEventListener(
    "click",
    newGame
);

difficultySelect.addEventListener(
    "change",
    newGame
);

soundButton.addEventListener(
    "click",
    () => {

        soundOn = !soundOn;

        soundButton.textContent =
            soundOn ? "🔊" : "🔇";

        if (soundOn) {
            sound(600, 0.06);
        }
    }
);


// ------------------------------------------
// START GAME
// ------------------------------------------

newGame();
