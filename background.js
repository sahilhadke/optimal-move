const API_KEY = "YOUR_RAPID";
const GEMINI_API_KEY = "GEMINI_API_KEY"; // Replace with your actual API key

async function fetchBestMove(fen) {
    const url = "https://chess-stockfish-16-api.p.rapidapi.com/chess/api";
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-rapidapi-host": "chess-stockfish-16-api.p.rapidapi.com",
        "x-rapidapi-key": API_KEY
    };

    const body = new URLSearchParams({ fen });

    try {
        const response = await fetch(url, { method: "POST", headers, body });
        const data = await response.json();
        return data.bestmove;
    } catch (error) {
        console.error("Failed to fetch best move:", error);
        return null;
    }
}

async function analyzeBestMove(fen, bestMove) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `Given the chess position in FEN notation: ${fen}
    The best move is: ${bestMove}
    Please explain why this is the best move in this position. Consider:
    1. The tactical and strategic elements
    2. How it improves the position
    3. What threats it creates or prevents
    Keep the explanation concise and focused on the key points. Give me only 2-3 sentences.`;

    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from Gemini API');
        }
    } catch (error) {
        console.error('Error analyzing move with Gemini:', error);
        return 'Unable to analyze the move at this time.';
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "FETCH_BEST_MOVE") {
        fetchBestMove(request.fen).then(bestMove => {
            sendResponse({ bestMove });
        });
        return true; // Async response
    }
    if (request.type === "ANALYZE_MOVE") {
        analyzeBestMove(request.fen, request.bestMove).then(analysis => {
            sendResponse({ analysis });
        });
        return true; // Async response
    }
}); 