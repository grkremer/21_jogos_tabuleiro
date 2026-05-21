import { PlacementMovementBase } from './PlacementMovementBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

export class ColMaisLivre extends PlacementMovementBase {
  get name() { return 'Colocação + Livre'; }
  get description() {
    return 'Fase de colocação (3 peças cada), depois qualquer peça pode mover para qualquer posição vazia.';
  }
  get origin() { return null; }

  getDestinations(pos, state) {
    return state.board.reduce((acc, v, i) => v === 0 ? [...acc, i] : acc, []);
  }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { ColMaisLivre as GameClass };
