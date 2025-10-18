const pieces = {
    'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙', 'wo': '⚜',
    'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟', 'bo': '<img src="pope-icon.svg" class="pope-icon" alt="Pope">'
};

let board = [
    ['br', 'bn', 'bb', 'bo', 'bk', 'bq', 'bb', 'bn', 'br'],
    ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
    ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
    ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
    ['wr', 'wn', 'wb', 'wq', 'wk', 'wo', 'wb', 'wn', 'wr']
];

let selectedSquare = null;
let validMoves = [];
let currentPlayer = 'white';

function initializeBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            
            if ((row + col) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }
            
            const piece = board[row][col];
            if (piece !== '.') {
                square.textContent = pieces[piece];
            }
            
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', () => handleSquareClick(row, col));
            
            boardElement.appendChild(square);
        }
    }
}

function isWhitePiece(piece) {
    return piece.startsWith('w');
}

function isBlackPiece(piece) {
    return piece.startsWith('b');
}

function isAlly(piece, player) {
    if (player === 'white') return isWhitePiece(piece);
    return isBlackPiece(piece);
}

function isEnemy(piece, player) {
    if (player === 'white') return isBlackPiece(piece);
    return isWhitePiece(piece);
}

function getValidMoves(row, col) {
    const piece = board[row][col];
    if (piece === '.') return [];
    
    const player = isWhitePiece(piece) ? 'white' : 'black';
    if (player !== currentPlayer) return [];
    
    const moves = [];
    const pieceType = piece[1];
    
    if (pieceType === 'o') {
        moves.push(...getPopeMoves(row, col, player));
    } else if (pieceType === 'k') {
        moves.push(...getKingMoves(row, col, player));
    } else if (pieceType === 'p') {
        moves.push(...getPawnMoves(row, col, player));
    } else if (pieceType === 'n') {
        moves.push(...getKnightMoves(row, col, player));
    } else if (pieceType === 'r') {
        moves.push(...getRookMoves(row, col, player));
    } else if (pieceType === 'b') {
        moves.push(...getBishopMoves(row, col, player));
    } else if (pieceType === 'q') {
        moves.push(...getRookMoves(row, col, player));
        moves.push(...getBishopMoves(row, col, player));
    }
    
    return moves;
}

function getPopeMoves(row, col, player) {
    const moves = [];
    
    const adjacent = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                const piece = board[nr][nc];
                if (piece !== '.') {
                    adjacent.push({piece, dr, dc});
                }
            }
        }
    }
    
    // If there are adjacent pieces, pope can jump
    if (adjacent.length > 0) {
        // Jump over adjacent allies
        for (let {piece, dr, dc} of adjacent) {
            if (isAlly(piece, player)) {
                // Can only land on the square directly after the ally
                const nr = row + dr * 2;
                const nc = col + dc * 2;
                if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                    if (board[nr][nc] === '.') {
                        moves.push([nr, nc]);
                    }
                }
            }
        }
        
        // Jump over adjacent enemies to capture
        for (let {piece, dr, dc} of adjacent) {
            if (isEnemy(piece, player)) {
                // Can only land on the square directly after the enemy
                const nr = row + dr * 2;
                const nc = col + dc * 2;
                if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                    if (board[nr][nc] === '.') {
                        moves.push([nr, nc]);
                    }
                }
            }
        }
    } else {
        // No adjacent pieces - move like a king
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                    const target = board[nr][nc];
                    if (target === '.' || isEnemy(target, player)) {
                        moves.push([nr, nc]);
                    }
                }
            }
        }
    }
    
    return moves;
}

function getKingMoves(row, col, player) {
    const moves = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
                const target = board[nr][nc];
                if (target === '.' || isEnemy(target, player)) {
                    moves.push([nr, nc]);
                }
            }
        }
    }
    return moves;
}

function getPawnMoves(row, col, player) {
    const moves = [];
    const piece = board[row][col];
    const direction = isWhitePiece(piece) ? -1 : 1;
    const startRow = isWhitePiece(piece) ? 7 : 1;
    
    if (row + direction >= 0 && row + direction < 9) {
        if (board[row + direction][col] === '.') {
            moves.push([row + direction, col]);
            
            if (row === startRow && board[row + 2 * direction][col] === '.') {
                moves.push([row + 2 * direction, col]);
            }
        }
    }
    
    for (let dc of [-1, 1]) {
        const nr = row + direction, nc = col + dc;
        if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
            if (isEnemy(board[nr][nc], player)) {
                moves.push([nr, nc]);
            }
        }
    }
    
    return moves;
}

function getKnightMoves(row, col, player) {
    const moves = [];
    const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (let [dr, dc] of knightMoves) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9) {
            const target = board[nr][nc];
            if (target === '.' || isEnemy(target, player)) {
                moves.push([nr, nc]);
            }
        }
    }
    return moves;
}

function getRookMoves(row, col, player) {
    const moves = [];
    const directions = [[0,1],[0,-1],[1,0],[-1,0]];
    for (let [dr, dc] of directions) {
        for (let i = 1; i < 9; i++) {
            const nr = row + dr * i, nc = col + dc * i;
            if (nr < 0 || nr >= 9 || nc < 0 || nc >= 9) break;
            const target = board[nr][nc];
            if (target === '.') {
                moves.push([nr, nc]);
            } else if (isEnemy(target, player)) {
                moves.push([nr, nc]);
                break;
            } else {
                break;
            }
        }
    }
    return moves;
}

function getBishopMoves(row, col, player) {
    const moves = [];
    const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
    for (let [dr, dc] of directions) {
        for (let i = 1; i < 9; i++) {
            const nr = row + dr * i, nc = col + dc * i;
            if (nr < 0 || nr >= 9 || nc < 0 || nc >= 9) break;
            const target = board[nr][nc];
            if (target === '.') {
                moves.push([nr, nc]);
            } else if (isEnemy(target, player)) {
                moves.push([nr, nc]);
                break;
            } else {
                break;
            }
        }
    }
    return moves;
}

function handleSquareClick(row, col) {
    if (validMoves.some(m => m[0] === row && m[1] === col)) {
        movePiece(selectedSquare[0], selectedSquare[1], row, col);
        clearSelection();
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        updateInfo();
        initializeBoard();
        return;
    }
    
    const piece = board[row][col];
    if (piece !== '.' && isAlly(piece, currentPlayer)) {
        selectedSquare = [row, col];
        validMoves = getValidMoves(row, col);
        highlightSelection();
    } else {
        clearSelection();
    }
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = '.';
}

function clearSelection() {
    selectedSquare = null;
    validMoves = [];
    highlightSelection();
}

function highlightSelection() {
    document.querySelectorAll('.square').forEach(sq => {
        sq.classList.remove('selected', 'valid-move');
    });
    
    if (selectedSquare) {
        const sq = document.querySelector(`[data-row="${selectedSquare[0]}"][data-col="${selectedSquare[1]}"]`);
        if (sq) sq.classList.add('selected');
        
        validMoves.forEach(([row, col]) => {
            const moveSq = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (moveSq) moveSq.classList.add('valid-move');
        });
    }
}

function updateInfo() {
    const infoEl = document.getElementById('info');
    infoEl.textContent = (currentPlayer === 'white' ? 'White' : 'Black') + ' to move';
}

function resetBoard() {
    board = [
        ['br', 'bn', 'bb', 'bo', 'bk', 'bq', 'bb', 'bn', 'br'],
        ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
        ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
        ['wr', 'wn', 'wb', 'wq', 'wk', 'wo', 'wb', 'wn', 'wr']
    ];
    selectedSquare = null;
    validMoves = [];
    currentPlayer = 'white';
    updateInfo();
    initializeBoard();
}

window.onload = function() {
    initializeBoard();
    updateInfo();
};
