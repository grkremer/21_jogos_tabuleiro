/**
 * Generic Minimax AI with Alpha-Beta pruning.
 * Works with any GameBase implementation.
 */
export class MinimaxAI {
  /**
   * @param {GameBase} game - the game instance
   * @param {number} maxDepth - search depth (difficulty)
   * @param {boolean} randomize - shuffle moves before evaluating (adds variety at shallow depths)
   */
  constructor(game, maxDepth, randomize = true) {
    this.game = game;
    this.maxDepth = maxDepth;
    this.randomize = randomize;
  }

  /**
   * Returns the best move for the current player in the given state.
   * @param {object} state
   * @returns {any} best move
   */
  getBestMove(state) {
    const player = state.currentPlayer;
    const maximizing = player === 1;

    let bestMove = null;
    let bestScore = maximizing ? -Infinity : Infinity;

    let moves = this.game.getValidMoves(state);
    if (moves.length === 0) return null;

    // Shuffle for variety (avoids always playing the same game at low depths)
    if (this.randomize) moves = this._shuffle(moves);

    for (const move of moves) {
      const next = this.game.applyMove(this.game.cloneState(state), move);
      const score = this._minimax(next, this.maxDepth - 1, -Infinity, Infinity, !maximizing);

      if (maximizing ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  _minimax(state, depth, alpha, beta, maximizing) {
    const result = this.game.checkResult(state);
    if (result.over || depth === 0) {
      return this.game.evaluate(state);
    }

    const moves = this.game.getValidMoves(state);

    if (maximizing) {
      let best = -Infinity;
      for (const move of moves) {
        const next = this.game.applyMove(this.game.cloneState(state), move);
        best = Math.max(best, this._minimax(next, depth - 1, alpha, beta, false));
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break; // beta cut-off
      }
      return best;
    } else {
      let best = Infinity;
      for (const move of moves) {
        const next = this.game.applyMove(this.game.cloneState(state), move);
        best = Math.min(best, this._minimax(next, depth - 1, alpha, beta, true));
        beta = Math.min(beta, best);
        if (beta <= alpha) break; // alpha cut-off
      }
      return best;
    }
  }

  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

/** Difficulty presets */
export const DIFFICULTY = {
  easy:   { depth: 1, label: 'Fácil',  icon: '🌱', randomize: true  },
  medium: { depth: 3, label: 'Médio',  icon: '⚡', randomize: true  },
  hard:   { depth: 9, label: 'Difícil', icon: '💀', randomize: false },
};
