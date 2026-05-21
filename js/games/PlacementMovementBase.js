import { GameBase } from '../engine/GameBase.js';

const ALL_WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

export class PlacementMovementBase extends GameBase {
  /** Number of pieces each player places before movement starts */
  get piecesPerPlayer() { return 3; }

  get interactionMode() { return 'placement'; }

  /** Called by app.js each render to get current interaction mode */
  getInteractionMode(state) {
    return state.phase; // 'placement' | 'movement'
  }

  get boardConfig() { return { type: 'tapatan', size: 3 }; }

  getInitialState() {
    return {
      board: Array(9).fill(0),
      currentPlayer: 1,
      phase: 'placement',
      placed: { 1: 0, 2: 0 },
      moveCount: 0,
    };
  }

  getValidMoves(state) {
    if (state.phase === 'placement') {
      return state.board.reduce((acc, v, i) => v === 0 ? [...acc, i] : acc, []);
    }
    const moves = [];
    for (let from = 0; from < 9; from++) {
      if (state.board[from] !== state.currentPlayer) continue;
      for (const to of this.getDestinations(from, state)) {
        if (state.board[to] === 0) moves.push({ from, to });
      }
    }
    return moves;
  }

  applyMove(state, move) {
    if (state.phase === 'placement') {
      state.board[move] = state.currentPlayer;
      state.placed[state.currentPlayer]++;
      state.currentPlayer = 3 - state.currentPlayer;
      if (state.placed[1] >= this.piecesPerPlayer && state.placed[2] >= this.piecesPerPlayer) {
        state.phase = 'movement';
      }
    } else {
      state.board[move.to] = state.board[move.from];
      state.board[move.from] = 0;
      state.currentPlayer = 3 - state.currentPlayer;
      state.moveCount++;
    }
    return state;
  }

  checkResult(state) {
    for (const [a, b, c] of this.getWinLines()) {
      const v = state.board[a];
      if (v !== 0 && v === state.board[b] && v === state.board[c])
        return { over: true, winner: v, line: [a, b, c] };
    }
    if (state.phase === 'movement' && state.moveCount >= 120)
      return { over: true, winner: 0, line: null };
    return { over: false, winner: null, line: null };
  }

  evaluate(state) {
    const result = this.checkResult(state);
    if (!result.over) return 0;
    if (result.winner === 1) return 1000;
    if (result.winner === 2) return -1000;
    return 0;
  }

  /** Subclasses can override to restrict which lines count as wins */
  getWinLines() { return ALL_WIN_LINES; }

  /** Subclasses must implement movement destinations */
  getDestinations(pos, state) {
    throw new Error('getDestinations() must be implemented by subclass');
  }
}
