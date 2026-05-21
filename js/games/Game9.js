import { PlacementMovementBase } from './PlacementMovementBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

// Only lines through the center (b2 = index 4) count as wins
const CENTER_WIN_LINES = [
  [3, 4, 5], [1, 4, 7],
  [0, 4, 8], [2, 4, 6],
];

export class ColMaisCentro extends PlacementMovementBase {
  get name() { return 'Colocação + Centro'; }
  get description() {
    return 'Fase de colocação (3 peças cada), depois movimentação livre — mas o alinhamento vencedor deve passar pelo centro do tabuleiro (b2).';
  }
  get origin() { return null; }

  // Free movement (any empty position)
  getDestinations(pos, state) {
    return state.board.reduce((acc, v, i) => v === 0 ? [...acc, i] : acc, []);
  }

  getWinLines() { return CENTER_WIN_LINES; }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { ColMaisCentro as GameClass };
