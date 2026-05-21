# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Webapp "Divirta-se com 21 Jogos Lógicos no Mesmo Tabuleiro", based on the book by Renato P. Ribas (CMS/Metamorfose, 2025, ISBN 978-65-6144-054-7). Vanilla JS ES modules, no build step, hosted on GitHub Pages at `github.com/grkremer/21_jogos_tabuleiro`.

**CRITICAL:** `Livro 1 miolo final.pdf` must NEVER be committed. It is listed in `.gitignore` and must stay there.

## Development

**Run locally** (ES modules require HTTP — do not open `index.html` directly):
```
python -m http.server 8080
```

**Deploy** — push to `main`; GitHub Pages auto-deploys (1–5 min). Monitor at `github.com/grkremer/21_jogos_tabuleiro/actions`.

## Architecture

Single-page app with three screens (`#screen-home`, `#screen-setup`, `#screen-game`), all in `index.html`. The entry point is `js/app.js` (ES module). No framework, no bundler.

```
css/style.css                    — dark theme, CSS custom properties, all layout
js/app.js                        — screen manager, game loop, AI scheduling, move handling
js/engine/GameBase.js            — abstract base class all games extend
js/engine/MinimaxAI.js           — generic alpha-beta minimax (works with any GameBase)
js/games/registry.js             — GAMES array (21 entries) + BONUS_GAMES + CATEGORIES
js/games/TapatanBoardRenderer.js — SVG renderer reused by all 9-point board games
js/games/MovementGameBase.js     — base for pre-positioned movement games (Games 2–5)
js/games/PlacementMovementBase.js — base for two-phase placement→movement games (Games 6–10)
js/games/BlockingGameBase.js     — base for blocking games / Mu Torere (Games 11–13)
js/games/TicTacToe.js            — Game 1
js/games/Game2.js–Game13.js      — Games 2–13 (all implemented)
```

Games are loaded lazily via `moduleLoader: () => import('./GameX.js')` in registry.js.

## Game Rules Reference

See **[GAMES.md](GAMES.md)** for full documentation: board layout, rules, initial positions, adjacency tables, win conditions, and implementation notes for all 21 games.

## Implementing a New Game

Each game module must export exactly `{ GameClass, renderBoard }`.

**`GameClass`** extends `GameBase` (or `MovementGameBase` for pre-positioned games) and implements:
- `get name()`, `get description()`, `get origin()`, `get boardConfig()`
- `getInitialState()` — state must include `{ currentPlayer: 1|2 }`
- `getValidMoves(state)` — array of moves (any type)
- `applyMove(state, move)` — mutates and returns state
- `checkResult(state)` — returns `{ over, winner: 1|2|0|null, line }`
- `evaluate(state)` — `+1000` = P1 wins, `-1000` = P2 wins, `0` = draw/ongoing

**`renderBoard(state, result, clickHandler, uiState?)`** — returns an SVGSVGElement. For placement games, `clickHandler(index)` is called on cell click. For movement games, pass `uiState = { selectedPiece, validDests }` through to the renderer.

Add entry in `registry.js` with `available: true` and `moduleLoader`.

## Interaction Modes

- **`'placement'`** (default): `clickHandler` receives a cell index. `handleCellClick` in app.js validates against `getValidMoves`.
- **`'movement'`**: declare `get interactionMode() { return 'movement'; }` on the game class. app.js uses `handlePositionClick` — a two-click model (first click selects piece, second click moves to valid destination). `state.selectedPiece` and `state.validDests` are maintained in app.js and passed as `uiState` to the renderer.
- **Dynamic mode**: implement `getInteractionMode(state)` to switch modes based on game state (e.g., `PlacementMovementBase` returns `state.phase` to switch from `'placement'` to `'movement'` mid-game). app.js calls `getCurrentInteractionMode()` which prefers this method over the static `interactionMode` getter.

## Movement Game Board (Tapatan/9-point)

Positions 0–8, row-major from top-left (`a3`) to bottom-right (`c1`). The 8 lines are the same as TicTacToe WIN_LINES. Initial board: `[2,1,2, 0,0,0, 1,2,1]` (P1 at 1,6,8; P2 at 0,2,7). Draw after 120 half-moves.

Tapatan adjacency (center=4 connects to all 8): `[[1,3,4],[0,2,4],[1,4,5],[0,4,6],[0,1,2,3,5,6,7,8],[2,4,8],[3,4,7],[4,6,8],[4,5,7]]`

## CSS Custom Properties

Player colors (used in SVG gradients and UI):
- P1 (white): `--p1: #dcdcdc`, `--p1-light: #ffffff`, `--p1-dark: #b0b0b0`, `--p1-glow`
- P2 (dark): `--p2: #686868`, `--p2-light: #a0a0a0`, `--p2-dark: #383838`, `--p2-glow`

SVG gradients are defined inline in each renderer (ids: `woodGrad`/`tpWood`, `p1Grad`/`tpP1`, `p2Grad`/`tpP2`). The `.ttt-board` CSS class is reused for all board SVGs.

## Minimax Difficulty

`DIFFICULTY` in `MinimaxAI.js`: easy=depth 1 (randomize), medium=depth 4 (randomize), hard=depth 9 (no randomize). The AI is fully generic — it only calls `getValidMoves`, `applyMove`, `checkResult`, `evaluate`, `cloneState`.
