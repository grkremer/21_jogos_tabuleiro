import { BlockingGameBase } from './BlockingGameBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

// P1 at corners (0,2,6,8), P2 at edges (1,3,5,7), center empty
// ⚠ Verificar posição inicial e regras de movimento no livro
const INITIAL_BOARD = [1, 2, 1, 2, 0, 2, 1, 2, 1];

export class MuTorereV1 extends BlockingGameBase {
  get name() { return 'Mu Torere (V1)'; }
  get description() {
    return 'Peças alternadas nos 8 pontos externos. Mova para posição vizinha vazia. Quem não conseguir mover perde.';
  }
  get origin() { return 'Nova Zelândia (Maori)'; }

  getInitialState() {
    return { board: [...INITIAL_BOARD], currentPlayer: 1, moveCount: 0 };
  }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { MuTorereV1 as GameClass };
