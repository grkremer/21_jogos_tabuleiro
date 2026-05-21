import { BlockingGameBase } from './BlockingGameBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

const ADJACENCY = [
  [1, 3, 4], [0, 2, 4], [1, 4, 5],
  [0, 4, 6], [0, 1, 2, 3, 5, 6, 7, 8], [2, 4, 8],
  [3, 4, 7], [4, 6, 8], [4, 5, 7],
];

// P1 (white) forms Γ on right: 2,5,7,8 — P2 (dark) forms L on left: 0,1,3,6 — center empty
const INITIAL_BOARD = [2, 2, 1, 2, 0, 1, 2, 1, 1];

export class MuTorereV3 extends BlockingGameBase {
  get name() { return 'Mu Torere (V3)'; }
  get description() {
    return 'Posição inicial original. Nos primeiros 2 movimentos de cada jogador, não é permitido mover para o centro (b2). Quem não conseguir mover perde.';
  }
  get origin() { return 'Nova Zelândia (Maori)'; }

  getInitialState() {
    return {
      board: [...INITIAL_BOARD],
      currentPlayer: 1,
      moveCount: 0,
      movesP1: 0,
      movesP2: 0,
    };
  }

  applyMove(state, { from, to }) {
    if (state.currentPlayer === 1) state.movesP1++;
    else state.movesP2++;
    state.board[to] = state.board[from];
    state.board[from] = 0;
    state.currentPlayer = 3 - state.currentPlayer;
    state.moveCount++;
    return state;
  }

  getValidMoves(state) {
    const playerMoves = state.currentPlayer === 1 ? state.movesP1 : state.movesP2;
    const canGoCenter = playerMoves >= 2;
    const moves = [];
    for (let from = 0; from < 9; from++) {
      if (state.board[from] !== state.currentPlayer) continue;
      for (const to of ADJACENCY[from]) {
        if (state.board[to] !== 0) continue;
        if (!canGoCenter && to === 4) continue;
        moves.push({ from, to });
      }
    }
    return moves;
  }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { MuTorereV3 as GameClass };
