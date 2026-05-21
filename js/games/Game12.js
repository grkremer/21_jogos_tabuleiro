import { BlockingGameBase } from './BlockingGameBase.js';
import { renderTapatanBoard } from './TapatanBoardRenderer.js';

// ⚠ Verificar piecesPerPlayer no livro (assumindo 4 peças cada)
const PIECES_PER_PLAYER = 4;

export class MuTorereV2 extends BlockingGameBase {
  get name() { return 'Mu Torere (V2)'; }
  get description() {
    return 'Fase de colocação: cada jogador posiciona suas 4 peças alternadamente. Depois, movimentação pelas linhas — quem não conseguir mover perde.';
  }
  get origin() { return 'Nova Zelândia (Maori)'; }

  get interactionMode() { return 'placement'; }

  getInteractionMode(state) {
    return state.phase ?? 'movement';
  }

  getInitialState() {
    return {
      board: Array(9).fill(0),
      currentPlayer: 1,
      phase: 'placement',
      placed: { 1: 0, 2: 0 },
      moveCount: 0,
    };
  }

  getValidMoves(state) {
    if (state.phase === 'placement') {
      return state.board.reduce((acc, v, i) => v === 0 ? [...acc, i] : acc, []);
    }
    return super.getValidMoves(state);
  }

  applyMove(state, move) {
    if (state.phase === 'placement') {
      state.board[move] = state.currentPlayer;
      state.placed[state.currentPlayer]++;
      state.currentPlayer = 3 - state.currentPlayer;
      if (state.placed[1] >= PIECES_PER_PLAYER && state.placed[2] >= PIECES_PER_PLAYER) {
        state.phase = 'movement';
      }
      return state;
    }
    return super.applyMove(state, move);
  }
}

export function renderBoard(state, result, onPositionClick, uiState) {
  return renderTapatanBoard(state, result, onPositionClick, uiState);
}

export { MuTorereV2 as GameClass };
