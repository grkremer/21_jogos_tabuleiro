import { PlacementMovementBase } from './PlacementMovementBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

const ADJACENCY = [
  [1, 3, 4], [0, 2, 4], [1, 4, 5],
  [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
  [3, 4, 7], [4, 6, 8], [4, 5, 7],
];

export class Achi3 extends PlacementMovementBase {
  get name() { return 'Achi (3 peças)'; }
  get description() {
    return 'Versão do Achi com 3 peças por jogador. Fase de colocação livre, depois movimentação pelas linhas do tabuleiro para posições vizinhas.';
  }
  get origin() { return 'Gana'; }

  getDestinations(pos, state) { return ADJACENCY[pos]; }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { Achi3 as GameClass };
