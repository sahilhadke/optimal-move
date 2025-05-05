<p align="center">
  <img src="https://raw.githubusercontent.com/sahilhadke/optimal-move/main/icon.png" width="128" height="128" alt="Icon">
</p>

<h1 align="center">
  Optimal Move
</h1>

<p align="center">
  A Chrome extension that uses the Stockfish chess engine to get the next best move on chess.com.
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/sahilhadke/optimal-move/main/resources/optimal-move.gif" alt="GIF of the extension in action">
</p>


## How to use

1. Download the code from this repository as a zip file.
2. Extract the contents of the zip file to a folder on your computer.
3. Go to https://rapidapi.com/cinnamon17/api/chess-stockfish-16-api/playground and get your free API key.
4. Add the API key to the `content.js` file.
5. Go to the Chrome extensions page by typing `chrome://extensions/` in the address bar.
6. Enable developer mode by toggling the switch in the top right corner.
7. Click "Load unpacked".
8. Select the folder that contains the extracted code.
9. Install the extension.
10. Go to chess.com and start a game.
11. A button labeled "Optimal Move" will appear on the screen.
12. Click on the button to get the next best move using the Stockfish chess engine.

## How it works

The extension extracts the current board from chess.com and sends it to the Stockfish API to get the next best move. The API returns the best move in UCI format, which is then displayed in the popup.

## Limitations

* The extension only works on chess.com.
* The extension does not support all chess variants (e.g. chess960, crazyhouse).
* The extension does not support analysis of games that are not currently in progress.

## Acknowledgments

The extension uses the Stockfish chess engine, which is licensed under the GNU General Public License version 3. The extension also uses the chess.js library, which is licensed under the MIT license.


