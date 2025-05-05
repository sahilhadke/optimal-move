chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_BOARD") {
        extractBoardInfo().then(board => {
            sendResponse(board);
        });
        return true; // Async response
    }
});

async function extractBoardInfo() {
    console.log("Extracting board info...");
    const moves = [];

    document.querySelectorAll(".main-line-row").forEach(row => {
        const whiteMoveElem = row.querySelector(".white-move.main-line-ply");
        const blackMoveElem = row.querySelector(".black-move.main-line-ply");

        if (whiteMoveElem) {
            const pieceElem = whiteMoveElem.querySelector("span > span[data-figurine]");
            const moveText = pieceElem ? `${pieceElem.dataset.figurine} ${whiteMoveElem.textContent}` : whiteMoveElem.textContent;
            moves.push(moveText.trim());
        }

        if (blackMoveElem) {
            const pieceElem = blackMoveElem.querySelector("span > span[data-figurine]");
            const moveText = pieceElem ? `${pieceElem.dataset.figurine} ${blackMoveElem.textContent}` : blackMoveElem.textContent;
            moves.push(moveText.trim());
        }
    });

    console.log("Extracted Moves:", moves);

    const game = new Chess();

    moves.forEach(rawMove => {
        const cleanedMove = cleanMove(rawMove);
        const result = game.move(cleanedMove);

        console.log("Raw move:", rawMove);
        console.log("Cleaned move:", cleanedMove);
        console.log(game.ascii());

        if (!result) {
            console.warn(`Skipped invalid move: ${cleanedMove}`);
        }
    });

    const fen = game.fen();
    console.log("Final FEN:", fen);

    const history = game.history({ verbose: true });
    const lastMove = history[history.length - 1];
    const lastMoveUci = lastMove ? `${lastMove.from}${lastMove.to}` : null;

    const bestMove = await fetchBestMove(fen);

    const map = {
        'a': 1,
        'b': 2,
        'c': 3,
        'd': 4,
        'e': 5,
        'f': 6,
        'g': 7,
        'h': 8
    };
    console.log("Best move:", bestMove);

    let first_square = bestMove.slice(0, 2);
    console.log('debug: ', first_square);
    first_square = map[first_square[0]] + first_square[1];

    console.log("First square:", first_square);

    let second_square = bestMove.slice(2, 4);
    console.log('debug: ', second_square);
    second_square = map[second_square[0]] + second_square[1];

    console.log("Second square:", second_square);

    const firstSquare = document.querySelector(`.square-${first_square}`);
    const secondSquare = document.querySelector(`.square-${second_square}`);

    let highlightDiv = null;
    if (!secondSquare) {
        const boardPlayComputer = document.getElementById('board-single');

        highlightDiv = document.createElement('div');
        highlightDiv.classList.add('highlight', 'to-remove-in-2-seconds', `square-${second_square}`);
        highlightDiv.style.backgroundColor = 'rgb(235, 97, 80)';
        highlightDiv.style.opacity = '0.8';
        highlightDiv.dataset.testElement = 'highlight';
        boardPlayComputer.appendChild(highlightDiv);
    } else {
        secondSquare.style.border = '5px solid red';
    }

    firstSquare.style.border = '5px solid red';

    setTimeout(() => {
        firstSquare.style.border = 'none';
        const highlightDiv = document.querySelector(`.to-remove-in-2-seconds`);
        if (highlightDiv) {
            highlightDiv.remove();
        }
        if (secondSquare) {
            secondSquare.style.border = 'none';
        }
    }, 1000);

    return {
        fen,
        lastMoveUci,
        bestMove
    };
}

function cleanMove(move) {
    move = move.trim();
    move = move.replace(/\s+/g, "").replace(/[+#]/g, "");

    const firstChar = move.charAt(0);

    if (firstChar) {
        move = firstChar + move.slice(1);
    }

    return move;
}

async function fetchBestMove(fen) {
    const url = "https://chess-stockfish-16-api.p.rapidapi.com/chess/api";
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-rapidapi-host": "chess-stockfish-16-api.p.rapidapi.com",
        "x-rapidapi-key": "API_KEY"
    };

    const body = new URLSearchParams({ fen });

    try {
        const response = await fetch(url, { method: "POST", headers, body });
        const data = await response.json();

        console.log("Best move from Stockfish API:", data.bestmove);
        return data.bestmove;
    } catch (error) {
        console.error("Failed to fetch best move:", error);
        return null;
    }
}

function addOptimalMoveButton() {
    const playerComponent = document.querySelector('.player-component.player-top');

    if (!playerComponent) {
        console.log("Player component not found yet. Retrying...");
        setTimeout(addOptimalMoveButton, 1000);
        return;
    }

    if (document.getElementById('get-next-best-move')) return;

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'get-next-best-move';

    const button = document.createElement('button');

    // button class cc-button-component cc-button-primary cc-bg-primary cc-button-medium
    button.classList.add('cc-button-component', 'cc-button-primary', 'cc-bg-primary', 'cc-button-medium');
    button.style.marginRight = '5px';
    button.style.marginLeft = '5px';
    button.style.height = '100%';
    
    button.textContent = "Optimal Move";
    button.addEventListener('click', extractBoardInfo);
    
    buttonContainer.appendChild(button);

    if (playerComponent.children.length >= 2) {
        playerComponent.insertBefore(buttonContainer, playerComponent.children[2]);
    } else {
        playerComponent.appendChild(buttonContainer);
    }

    console.log("Optimal Move button added!");
}

window.addEventListener("load", () => {
    setTimeout(addOptimalMoveButton, 2000);
});
