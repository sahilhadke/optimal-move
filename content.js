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

    const bestMove = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
            { type: "FETCH_BEST_MOVE", fen },
            (response) => resolve(response.bestMove)
        );
    });

    // Get move analysis from Gemini
    const moveAnalysis = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
            { type: "ANALYZE_MOVE", fen, bestMove },
            (response) => resolve(response.analysis)
        );
    });

    // Show the analysis popup
    showAnalysisPopup(moveAnalysis);

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
        var boardPlayComputer = document.getElementById('board-single');

        if (!boardPlayComputer) {
            // wc-chess-board with id board-play-computer
            boardPlayComputer = document.querySelector('#board-play-computer');
        }

        highlightDiv = document.createElement('div');
        highlightDiv.classList.add('highlight', 'to-remove-in-2-seconds', `square-${second_square}`);
        highlightDiv.style.backgroundColor = 'rgb(235, 97, 80)';
        highlightDiv.style.opacity = '0.8';
        highlightDiv.dataset.testElement = 'highlight';
        boardPlayComputer.appendChild(highlightDiv);
    } else {
        secondSquare.style.backgroundColor = 'rgb(235, 97, 80)';
        secondSquare.style.opacity = '0.8';
    }

    firstSquare.style.backgroundColor = 'rgb(235, 97, 80)';
    firstSquare.style.opacity = '0.8';

    setTimeout(() => {
        firstSquare.style.backgroundColor = '';
        firstSquare.style.opacity = '';
        const highlightDiv = document.querySelector(`.to-remove-in-2-seconds`);
        if (highlightDiv) {
            highlightDiv.remove();
        }
        if (secondSquare) {
            secondSquare.style.backgroundColor = '';
            secondSquare.style.opacity = '';
        }
    }, 1000);

    return {
        fen,
        lastMoveUci,
        bestMove,
        moveAnalysis
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

function addOptimalMoveButton() {
    console.log("Adding optimal move button...");
    var playerComponent = document.querySelector('.player-component.player-bottom');

    // if playerComponent is not found, search for div with id player-bottom
    if (!playerComponent) {
        playerComponent = document.querySelector('#player-bottom');
        // in div class player-row-wrapper which is anywhere under playerComponent, find the first div with class player-component
        playerComponent = playerComponent.querySelector('.player-row-wrapper');
    }

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
// Add this function to create and show the popup
function showAnalysisPopup(analysis) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('move-analysis-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'move-analysis-popup';
    popup.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgb(93 153 72);
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 300px;
        z-index: 9999;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    `;

    const title = document.createElement('div');
    title.textContent = 'Move Analysis';
    title.style.fontWeight = 'bold';

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0 5px;
    `;
    closeButton.onclick = () => popup.remove();

    header.appendChild(title);
    header.appendChild(closeButton);

    // Create content
    const content = document.createElement('div');
    content.textContent = analysis;

    // Assemble popup
    popup.appendChild(header);
    popup.appendChild(content);
    document.body.appendChild(popup);

    // Trigger animation
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translateY(0)';
    }, 10);
}

