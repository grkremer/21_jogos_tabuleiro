import { MovementGameBase } from './MovementGameBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

const ADJACENCY = [
  [1, 3, 4], [0, 2, 4], [1, 4, 5],
  [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
  [3, 4, 7], [4, 6, 8], [4, 5, 7],
];

// JUMPS[i] = list of [intermediate, landing] pairs for position i
// Built from the 8 board lines: from each endpoint, jump over middle to far end
const BOARD_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];
const JUMPS = Array.from({ length: 9 }, () => []);
for (const [a, b, c] of BOARD_LINES) {
  JUMPS[a].push([b, c]);
  JUMPS[c].push([b, a]);
  // middle (b) has no jump along this line
}

export class TsoroYematatu extends MovementGameBase {
  get name() { return 'Tsoro Yematatu'; }
  get description() {
    return 'Além de mover para posições vizinhas, a peça pode saltar sobre qualquer peça adjacente (em linha), pousando na posição vazia seguinte.';
  }
  get origin() { return 'Zimbábue'; }

  getDestinations(pos, state) {
    const dests = new Set();
    // Adjacent moves (Tapatan-style)
    for (const adj of ADJACENCY[pos]) {
      if (state.board[adj] === 0) dests.add(adj);
    }
    // Jump moves: over an occupied cell to an empty landing
    for (const [mid, land] of JUMPS[pos]) {
      if (state.board[mid] !== 0 && state.board[land] === 0) dests.add(land);
    }
    return [...dests];
  }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { TsoroYematatu as GameClass };
