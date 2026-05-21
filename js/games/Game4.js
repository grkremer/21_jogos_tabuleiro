import { MovementGameBase } from './MovementGameBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

// Only lines that pass through the center (b2 = index 4) count as wins
const WIN_LINES = [
  [3, 4, 5], [1, 4, 7],
  [0, 4, 8], [2, 4, 6],
];

const ADJACENCY = [
  [1, 3, 4], [0, 2, 4], [1, 4, 5],
  [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
  [3, 4, 7], [4, 6, 8], [4, 5, 7],
];

export class Shisima extends MovementGameBase {
  get name() { return 'Shisima'; }
  get description() {
    return 'Como o Tapatan, mas só conta o alinhamento que passe pelo centro do tabuleiro (b2).';
  }
  get origin() { return 'Quênia'; }

  getDestinations(pos, state) { return ADJACENCY[pos]; }

  checkResult(state) {
    for (const [a, b, c] of WIN_LINES) {
      const v = state.board[a];
      if (v !== 0 && v === state.board[b] && v === state.board[c])
        return { over: true, winner: v, line: [a, b, c] };
    }
    if (state.moveCount >= 120) return { over: true, winner: 0, line: null };
    return { over: false, winner: null, line: null };
  }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { Shisima as GameClass };
