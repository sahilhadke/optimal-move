chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_BOARD") {
        extractBoardInfo().then(board => {
            sendResponse(board);
        });
        return true; // Async response
    }
});

async function extractBoardInfo() {
    const moves = [];

    // Extract moves from DOM
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

    // Get last move in UCI format
    const history = game.history({ verbose: true });
    const lastMove = history[history.length - 1];
    const lastMoveUci = lastMove ? `${lastMove.from}${lastMove.to}` : null;

    const bestMove = await fetchBestMove(fen);

    return {
        fen,
        lastMoveUci,
        bestMove
    };
}

function cleanMove(move) {
    move = move.trim();

    // Remove multiple spaces and check/mate symbols
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
        "x-rapidapi-key": "API_KEY" // Replace with your actual API key
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
