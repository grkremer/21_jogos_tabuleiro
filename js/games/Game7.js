import { PlacementMovementBase } from './PlacementMovementBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

const ADJACENCY = [
  [1, 3, 4], [0, 2, 4], [1, 4, 5],
  [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
  [3, 4, 7], [4, 6, 8], [4, 5, 7],
];

export class Achi4 extends PlacementMovementBase {
  get name() { return 'Achi (4 peças)'; }
  get description() {
    return 'Cada jogador coloca 4 peças alternadamente, depois move pelas linhas do tabuleiro para posições vizinhas. Com 8 peças em 9 posições, cada movimento é muito restrito.';
  }
  get origin() { return 'Gana'; }
  get piecesPerPlayer() { return 4; }

  getDestinations(pos, state) { return ADJACENCY[pos]; }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { Achi4 as GameClass };
