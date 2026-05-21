import { GameBase } from '../engine/GameBase.js';

const ADJACENCY = [
  [1, 3, 4], [0, 2, 4], [1, 4, 5],
  [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
  [3, 4, 7], [4, 6, 8], [4, 5, 7],
];

export class BlockingGameBase extends GameBase {
  get interactionMode() { return 'movement'; }
  get boardConfig() { return { type: 'tapatan', size: 3 }; }

  getInitialState() {
    return {
      // P1 at corners, P2 at edges, center empty — override in subclass if needed
      board: [1, 2, 1, 2, 0, 2, 1, 2, 1],
      currentPlayer: 1,
      moveCount: 0,
    };
  }

  getValidMoves(state) {
    const moves = [];
    for (let from = 0; from < 9; from++) {
      if (state.board[from] !== state.currentPlayer) continue;
      for (const to of this.getDestinations(from, state)) {
        if (state.board[to] === 0) moves.push({ from, to });
      }
    }
    return moves;
  }

  applyMove(state, { from, to }) {
    state.board[to] = state.board[from];
    state.board[from] = 0;
    state.currentPlayer = 3 - state.currentPlayer;
    state.moveCount++;
    return state;
  }

  /** Whoever has no moves loses */
  checkResult(state) {
    if (this.getValidMoves(state).length === 0)
      return { over: true, winner: 3 - state.currentPlayer, line: null };
    if (state.moveCount >= 200) return { over: true, winner: 0, line: null };
    return { over: false, winner: null, line: null };
  }

  evaluate(state) {
    const result = this.checkResult(state);
    if (result.over) return result.winner === 1 ? 1000 : result.winner === 2 ? -1000 : 0;
    // Mobility heuristic: more available moves = better position
    const count = (player) => {
      let n = 0;
      for (let from = 0; from < 9; from++) {
        if (state.board[from] !== player) continue;
        for (const to of this.getDestinations(from, state)) {
          if (state.board[to] === 0) n++;
        }
      }
      return n;
    };
    return count(1) - count(2);
  }

  /** Default: Tapatan adjacency. Subclasses may override. */
  getDestinations(pos, state) { return ADJACENCY[pos]; }
}
