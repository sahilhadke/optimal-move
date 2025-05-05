# Optimal Move

A Chrome extension that uses the Stockfish chess engine to get the next best move on chess.com.

## How to use

1. Install the extension from the Chrome Web Store.
2. Go to chess.com and start a game.
3. Click on the extension icon in the top right corner of the browser.
4. The extension will load the current board and make a request to the Stockfish API to get the next best move.
5. The best move will be displayed in the popup.

## How it works

The extension extracts the current board from chess.com and sends it to the Stockfish API to get the next best move. The API returns the best move in UCI format, which is then displayed in the popup.

## Limitations

* The extension only works on chess.com.
* The extension does not support all types of chess games (e.g. blitz, bullet).
* The extension does not support all chess variants (e.g. chess960, crazyhouse).
* The extension does not support analysis of games that are not currently in progress.

## Known issues

* The extension may not work properly if the game is paused or if the user is not logged in.
* The extension may not work properly if the game is not in the standard algebraic notation (e.g. if the game is in a different language).

## Development

The extension is written in HTML, CSS, and JavaScript. The code is hosted on GitHub and can be modified and redistributed under the MIT license.

## License

The extension is licensed under the MIT license. See the LICENSE file for more information.

## Acknowledgments

The extension uses the Stockfish chess engine, which is licensed under the GNU General Public License version 3. The extension also uses the chess.js library, which is licensed under the MIT license.
