import { PlacementMovementBase } from './PlacementMovementBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

const ADJACENCY = [
  [1, 3, 4], [0, 2, 4], [1, 4, 5],
  [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
  [3, 4, 7], [4, 6, 8], [4, 5, 7],
];

// JUMPS[i] = [[mid, land], ...] — from i, jump over mid to land
const BOARD_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];
const JUMPS = Array.from({ length: 9 }, () => []);
for (const [a, b, c] of BOARD_LINES) {
  JUMPS[a].push([b, c]);
  JUMPS[c].push([b, a]);
}

export class ColMaisSalto extends PlacementMovementBase {
  get name() { return 'Colocação + Salto'; }
  get description() {
    return 'Fase de colocação (3 peças cada), depois movimentação estilo Tsoro: mova para posição vizinha ou salte sobre qualquer peça para a posição vazia atrás dela.';
  }
  get origin() { return 'Zimbábue'; }

  getDestinations(pos, state) {
    const dests = new Set();
    for (const adj of ADJACENCY[pos]) {
      if (state.board[adj] === 0) dests.add(adj);
    }
    for (const [mid, land] of JUMPS[pos]) {
      if (state.board[mid] !== 0 && state.board[land] === 0) dests.add(land);
    }
    return [...dests];
  }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { ColMaisSalto as GameClass };
