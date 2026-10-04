// размер поля
const size = 10;
//количество мин
const minesCount = 12;
//состояние поля
let board = [];
//продолжается игра?
let gameOver = false;
// счетчик открытых полей
let revealedCount = 0;

//подключение к боарду
const boardElement = document.querySelector('#board');
//подключение к месседж
const messageElement = document.querySelector('#message');


function startGame() {
    //очищаем боард
    boardElement.innerHTML = '';
    //очищаем мессадж
    messageElement.textContent = '';
    //обнуляем массив
    board = [];
    //игра идет при false
    gameOver = false;
    //начальный счет
    revealedCount = 0;

    // Создаем сетку
    for (let r = 0; r < size; r++) {
        //массив для строки
        let row = [];
        //цикл для создания столбцов
        for (let c = 0; c < size; c++) {
            //объект-клетка
            let cell = {
                //номер строки
                r: r,
                //номер столбца
                c: c,
                //стоит ли мина
                mine: false,
                //открыта ли клетка?
                revealed: false,
                //стоит ли на ней флаг
                flagged: false,
                //сколько мин рядом?
                count: 0,
                //ссылка элемент, пока что пустая
                element: null
            };

            //cоздание нового элемента див
            const el = document.createElement('div');
            //добавление к нему класса
            el.classList.add('cell');
            //проверяем клик и при клике запускается метод clickCell
            el.addEventListener('click', () => clickCell(cell));
            //проверяем нажатие правой кнопкой мыши?
            el.addEventListener('contextmenu', (e) => {
                //отмена всплытия окошка на нажатие правой кнопки мыши
                e.preventDefault();
                //вызов метода флагселл
                flagCell(cell);
            });

            //добавляем созданный див в клетку
            boardElement.appendChild(el);
            //говорим что клетка это элемент на странице
            cell.element = el;
            //добавляем клет    ку в массив row
            row.push(cell);
        }
        //добавляем row в массив боард
        board.push(row);
    }

    // Расставляем мины

    //счетчик поставленных мин
    let placed = 0;
    //цикл, пока не выполним все мины
    while (placed < minesCount) {
        //случайное число по оси х, чтобы выбрать строку в какую будет ставиться мина
        let r = Math.floor(Math.random() * size);
        //по оси у
        let c = Math.floor(Math.random() * size);
        //проверка, что в этой клетке нет еще мин
        //board[r] - в поле найди строку, [с] - найди ячейку
        if (!board[r][c].mine) {
            //ставим мину
            board[r][c].mine = true;
            //прибавляем к счетчику мин +1
            placed++;
        }
    }

    // Считаем цифры
    //цикл для строки
    for (let r = 0; r < size; r++) {
        //для ячейки
        for (let c = 0; c < size; c++) {
            //если в клетке мина, то пропускаем
            if (board[r][c].mine) continue;

            // число мин вокруг = 0
            let count = 0;
            //цикл d - cмещение, dr - в строке, dc - в ячейке
            for (let dr = -1; dr <= 1; dr++) {  
                for (let dc = -1; dc <= 1; dc++) {
                    // n - new; NewRow, NewColumn 
                    //от нашей строки прибавляем смещение
                    let nr = r + dr;
                    //от нашей ячейки смещение
                    let nc = c + dc;

                    //защита от выхода за границу
                    if (
                        //проверяем, есь ли вообще сосед внтри поля?
                        nr >= 0 && nr < size &&
                        nc >= 0 && nc < size &&
                        //и тут есть мина?
                        board[nr][nc].mine
                    ) {
                        //увеличиваем число мин вокруг на 1
                        count++;
                    }
                }
            }
            //подключаемся к полю и записываем на нем это число
            board[r][c].count = count;
        }
    }
}

//функция клика
function clickCell(cell) {
    //если игра закончена или клетка уже открыта или на ней флаг - разрыв
    if (gameOver || cell.revealed || cell.flagged) return;

    //если клетка - мина
    if (cell.mine) {
        //добавляем ее в класс мина
        cell.element.classList.add('mine');
        //рисуем бомбочку
        cell.element.textContent = '💣';
        //пишем в сообщении под блоком - вы проиграли
        messageElement.textContent = 'Вы проиграли!';
        //игра прекращается
        gameOver = true;
        //показываем все мины
        revealMines();
        //разрыв
        return;
    }

    //открытие клетки и ее соседей
    reveal(cell);

    //если все безопасные клетки открыты?
    if (revealedCount === size * size - minesCount) {
        //победа
        messageElement.textContent = 'Победа!';
        //игра закончена
        gameOver = true;
    }
}


function reveal(cell) {
    //если клетка уже открыта или под флагом, то разрыв
    if (cell.revealed || cell.flagged) return;

    //помечаем, как открытую
    cell.revealed = true;
    //увеличиваем счетчик открытых
    revealedCount++;
    //добавляем класс опен
    cell.element.classList.add('open');

    //если рядом есть мины
    if (cell.count > 0) {
        //пишем количество мин на клетках
        cell.element.textContent = cell.count;
        //иначе
    } else {
        //открываем клетки без мин
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                let nr = cell.r + dr;
                let nc = cell.c + dc;

                if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                    reveal(board[nr][nc]);
                }
            }
        }
    }
}


function flagCell(cell) {
    //если игра кончилась иил клетка открыта - разрыв
    if (gameOver || cell.revealed) return;

    // если флага не было - ставим, и наоборот
    cell.flagged = !cell.flagged;
    //если флага не было - ставим, иначе убираем
    cell.element.textContent = cell.flagged ? '🚩' : '';
}

//функция открытия мин после проигрыша или выигрыша
function revealMines() {
    //проверка всех клеток
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            //если были мины
            if (board[r][c].mine) {
                //открыть
                board[r][c].element.textContent = '💣';
                //добавить в класс мины
                board[r][c].element.classList.add('mine');
            }
        }
    }
}
//запуск игры
startGame();