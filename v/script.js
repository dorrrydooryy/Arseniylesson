// Размеры поля из вашей новой HTML/CSS структуры (30 * 15 = 450 клеток)
const sizeX = 30; // Количество столбцов
const sizeY = 30; // Количество строк
const minesCount = 60; // Количество мин для такого поля

let board = [];
let gameOver = false;
let revealedCount = 0;

// Привязываемся к вашему новому интерфейсу
const boardElement = document.querySelector('.field');
const messageElement = document.getElementById('status-message');
const restartBtn = document.getElementById('restart-btn');

function startGame() {
    boardElement.innerHTML = '';
    messageElement.textContent = 'Сапёр (30x15)';
    board = [];
    gameOver = false;
    revealedCount = 0;

    // 1. Создаем сетку 30х15
    for (let r = 0; r < sizeY; r++) {
        let row = [];
        for (let c = 0; c < sizeX; c++) {
            let cell = {
                r: r, c: c,
                mine: false,
                revealed: false,
                flagged: false,
                count: 0,
                element: null
            };
            
            const el = document.createElement('div');
            el.classList.add('cell');
            
            // Навешиваем обработчики кликов
            el.addEventListener('click', () => clickCell(cell));
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagCell(cell);
            });
            
            boardElement.appendChild(el);
            cell.element = el;
            row.push(cell);
        }
        board.push(row);
    }

    // 2. Расставляем мины
    let placed = 0;
    while (placed < minesCount) {
        let r = Math.floor(Math.random() * sizeY);
        let c = Math.floor(Math.random() * sizeX);
        if (!board[r][c].mine) {
            board[r][c].mine = true;
            placed++;
        }
    }

    // 3. Считаем цифры вокруг мин
    for (let r = 0; r < sizeY; r++) {
        for (let c = 0; c < sizeX; c++) {
            if (board[r][c].mine) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < sizeY && nc >= 0 && nc < sizeX && board[nr][nc].mine) {
                        count++;
                    }
                }
            }
            board[r][c].count = count;
        }
    }
}

function clickCell(cell) {
    if (gameOver || cell.revealed || cell.flagged) return;

    if (cell.mine) {
        cell.element.classList.add('mine');
        cell.element.textContent = '💣';
        messageElement.textContent = '💥 Игра окончена!';
        gameOver = true;
        revealMines();
        return;
    }

    reveal(cell);

    
    if (revealedCount === (sizeX * sizeY) - minesCount) {
        messageElement.textContent = '🎉 Победа!';
        gameOver = true;
    }
}

function reveal(cell) {
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    revealedCount++;
    cell.element.classList.add('open');

    if (cell.count > 0) {
        cell.element.textContent = cell.count;
    } else {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                let nr = cell.r + dr, nc = cell.c + dc;
                if (nr >= 0 && nr < sizeY && nc >= 0 && nc < sizeX) {
                    reveal(board[nr][nc]);
                }
            }
        }
    }
}

function flagCell(cell) {
    if (gameOver || cell.revealed) return;
    cell.flagged = !cell.flagged;
    
    if (cell.flagged) {
        cell.element.classList.add('flagged');
        cell.element.textContent = '🚩';
    } else {
        cell.element.classList.remove('flagged');
        cell.element.textContent = '';
    }
}

function revealMines() {
    for (let r = 0; r < sizeY; r++) {
        for (let c = 0; c < sizeX; c++) {
            if (board[r][c].mine) {
                board[r][c].element.textContent = '💣';
                board[r][c].element.classList.add('mine');
            }
        }
    }
}


restartBtn.addEventListener('click', startGame);


startGame();
