import { GAMES, BONUS_GAMES, CATEGORIES } from './games/registry.js';
import { MinimaxAI, DIFFICULTY } from './engine/MinimaxAI.js';

// ─── App State ────────────────────────────────────────────────
const state = {
  currentGameDef: null,
  gameInstance:   null,
  boardRenderer:  null,   // function(gameState, result, clickHandler, uiState?) -> SVGElement
  gameState:      null,
  mode:           'local',
  difficulty:     'medium',
  startingPlayer: 1,      // 1, 2, or 'random'
  aiPlayer:       2,
  ai:             null,
  score:          { 1: 0, 2: 0, draw: 0 },
  p1Name:         'Jogador 1',
  p2Name:         'Jogador 2',
  isAIThinking:   false,
  selectedPiece:  null,   // for movement games: currently selected piece index
  validDests:     [],     // for movement games: valid destination indices
};

// ─── Screen management ───────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ─── HOME SCREEN ─────────────────────────────────────────────
function buildHomeScreen() {
  const container = document.getElementById('games-container');
  container.innerHTML = '';

  for (const cat of CATEGORIES) {
    const block = document.createElement('div');
    block.className = 'category-block';

    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
      <div class="category-icon">${cat.icon}</div>
      <span class="category-title">${cat.label}</span>
      <div class="category-line"></div>
    `;
    block.appendChild(header);

    const gamesInCat = GAMES.filter(g => g.category === cat.id);
    const grid = document.createElement('div');
    grid.className = 'games-grid';

    for (const game of gamesInCat) {
      grid.appendChild(buildGameCard(game));
    }

    block.appendChild(grid);
    container.appendChild(block);
  }

  // Bonus section
  const bonusBlock = document.createElement('div');
  bonusBlock.className = 'category-block';
  bonusBlock.innerHTML = `
    <div class="category-header">
      <div class="category-icon">⭐</div>
      <span class="category-title">Bônus</span>
      <div class="category-line"></div>
    </div>
  `;
  const bonusGrid = document.createElement('div');
  bonusGrid.className = 'games-grid';
  for (const g of BONUS_GAMES) {
    bonusGrid.appendChild(buildBonusCard(g));
  }
  bonusBlock.appendChild(bonusGrid);
  container.appendChild(bonusBlock);
}

function buildGameCard(game) {
  const card = document.createElement('div');
  card.className = `game-card${game.available ? '' : ' coming-soon'}`;

  const statusBadge = game.available
    ? `<span class="available-badge">Disponível</span>`
    : `<span class="coming-soon-badge">Em Breve</span>`;

  const originLine = game.origin
    ? `<div class="game-card-origin">📍 ${game.origin}</div>`
    : '';

  const altName = game.nameAlt
    ? ` <span style="font-weight:400;font-size:13px;color:var(--text3)">(${game.nameAlt})</span>`
    : '';

  const playBtn = game.available
    ? `<button class="btn-play-card">Jogar agora</button>`
    : '';

  card.innerHTML = `
    <div class="game-card-header">
      <div class="game-num-badge">${game.num}</div>
      ${statusBadge}
    </div>
    <div class="game-board-mini">${miniGridSVG()}</div>
    <div class="game-card-name">${game.name}${altName}</div>
    ${originLine}
    <div class="game-card-desc">${game.description}</div>
    ${playBtn}
  `;

  if (game.available) {
    const btn = card.querySelector('.btn-play-card');
    btn.addEventListener('click', e => { e.stopPropagation(); openSetup(game); });
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openSetup(game));
  }

  return card;
}

function buildBonusCard(game) {
  const card = document.createElement('div');
  card.className = 'game-card coming-soon';
  card.innerHTML = `
    <div class="game-card-header">
      <div class="game-num-badge" style="background:var(--gold);border-color:var(--gold)">★</div>
      <span class="coming-soon-badge">Em Breve</span>
    </div>
    <div class="game-card-name">${game.name}</div>
    <div class="game-card-desc">${game.description}</div>
  `;
  return card;
}

function miniGridSVG() {
  return `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="60" rx="6" fill="#c9975a"/>
    <line x1="20" y1="4" x2="20" y2="56" stroke="#6b3d1e" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="40" y1="4" x2="40" y2="56" stroke="#6b3d1e" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="4"  y1="20" x2="56" y2="20" stroke="#6b3d1e" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="4"  y1="40" x2="56" y2="40" stroke="#6b3d1e" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="10" y1="10" x2="26" y2="26" stroke="#dcdcdc" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="26" y1="10" x2="10" y2="26" stroke="#dcdcdc" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="50" cy="30" r="7" fill="none" stroke="#686868" stroke-width="3.5"/>
    <circle cx="30" cy="50" r="7" fill="none" stroke="#686868" stroke-width="3.5"/>
    <line x1="34" y1="14" x2="46" y2="14" stroke="#dcdcdc" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="40" y1="8"  x2="40" y2="20" stroke="#dcdcdc" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`;
}

// ─── SETUP SCREEN ─────────────────────────────────────────────
function openSetup(gameDef) {
  state.currentGameDef = gameDef;

  document.getElementById('setup-game-num').textContent = gameDef.num;
  document.getElementById('setup-game-title').textContent = gameDef.name;
  document.getElementById('setup-game-desc').textContent = gameDef.description;

  // Reset UI selections
  activateBtn('[data-mode]', 'local');
  activateBtn('[data-diff]', 'medium');
  activateBtn('[data-starts]', '1');
  state.mode = 'local';
  state.difficulty = 'medium';
  state.startingPlayer = 1;

  document.getElementById('section-difficulty').style.display = 'none';

  showScreen('screen-setup');
}

function activateBtn(groupSelector, value) {
  document.querySelectorAll(groupSelector).forEach(b => {
    const k = Object.keys(b.dataset)[0];
    b.classList.toggle('active', b.dataset[k] === value);
  });
}

// ─── START GAME ───────────────────────────────────────────────
async function startGame() {
  const def = state.currentGameDef;

  // Load game module
  const mod = await def.moduleLoader();
  state.gameInstance = new mod.GameClass();
  state.boardRenderer = mod.renderBoard;

  // Configure players
  if (state.mode === 'ai') {
    const diff = DIFFICULTY[state.difficulty];
    state.ai = new MinimaxAI(state.gameInstance, diff.depth, diff.randomize);
    state.p2Name = `🤖 IA — ${diff.label}`;
  } else {
    state.ai = null;
    state.p2Name = 'Jogador 2';
  }

  // Reset scores for new game session
  state.score = { 1: 0, 2: 0, draw: 0 };
  updateScoreDisplay();

  startRound();
  showScreen('screen-game');
}

// ─── ROUND MANAGEMENT ────────────────────────────────────────
function startRound() {
  // Resolve starting player
  let first = state.startingPlayer;
  if (first === 'random') first = Math.random() < 0.5 ? 1 : 2;
  state.startingPlayer = Number(first); // store resolved value

  state.gameState = state.gameInstance.getInitialState();
  state.gameState.currentPlayer = state.startingPlayer;
  state.isAIThinking = false;
  state.selectedPiece = null;
  state.validDests = [];

  // Update labels
  document.getElementById('game-topbar-title').textContent = state.currentGameDef.name;
  document.getElementById('player1-name').textContent = state.p1Name;
  document.getElementById('player2-name').textContent = state.p2Name;

  // Hide win overlay
  document.getElementById('win-overlay').classList.remove('visible');

  renderBoard();
  updateTurnUI();

  // AI moves first if needed
  if (state.mode === 'ai' && state.gameState.currentPlayer === state.aiPlayer) {
    scheduleAIMove();
  }
}

// ─── INTERACTION MODE ────────────────────────────────────────
function getCurrentInteractionMode() {
  const game = state.gameInstance;
  if (typeof game.getInteractionMode === 'function') {
    return game.getInteractionMode(state.gameState);
  }
  return game.interactionMode ?? 'placement';
}

// ─── BOARD RENDERING ─────────────────────────────────────────
function renderBoard() {
  if (!state.boardRenderer) return;

  const boardEl = document.getElementById('game-board');
  const result = state.gameInstance.checkResult(state.gameState);

  const humanTurn = state.mode === 'local' ||
    state.gameState.currentPlayer !== state.aiPlayer;
  const clickable = !result.over && !state.isAIThinking && humanTurn;

  const interactionMode = getCurrentInteractionMode();
  const isMovement = interactionMode === 'movement';
  const isTapatanPlacement = !isMovement &&
    state.gameInstance.boardConfig?.type === 'tapatan';

  const clickHandler = clickable
    ? (isMovement ? handlePositionClick : handleCellClick)
    : null;

  let uiState;
  if (isMovement) {
    uiState = {
      selectedPiece:    state.selectedPiece,
      validDests:       state.validDests,
      getValidDestsFor: (idx) => {
        const moves = state.gameInstance.getValidMoves(state.gameState);
        return moves.filter(m => m.from === idx).map(m => m.to);
      },
    };
  } else if (isTapatanPlacement) {
    uiState = { phase: 'placement' };
  }

  const svg = state.boardRenderer(state.gameState, result, clickHandler, uiState);

  boardEl.innerHTML = '';
  boardEl.appendChild(svg);
}

// ─── MOVE HANDLING ───────────────────────────────────────────
function handleCellClick(cellIndex) {
  if (state.isAIThinking) return;
  const result = state.gameInstance.checkResult(state.gameState);
  if (result.over) return;
  if (!state.gameInstance.getValidMoves(state.gameState).includes(cellIndex)) return;

  applyMove(cellIndex);
}

function handlePositionClick(idx, dragTo = null) {
  if (state.isAIThinking) return;
  const result = state.gameInstance.checkResult(state.gameState);
  if (result.over) return;

  const board = state.gameState.board;
  const currentPlayer = state.gameState.currentPlayer;

  // ── Drag completion: (from, to) passed directly ───────────────
  if (dragTo !== null) {
    if (board[idx] !== currentPlayer) return;
    const validMoves = state.gameInstance.getValidMoves(state.gameState);
    const dests = validMoves.filter(m => m.from === idx).map(m => m.to);
    if (dests.includes(dragTo)) {
      state.selectedPiece = null;
      state.validDests = [];
      applyMove({ from: idx, to: dragTo });
    }
    return;
  }

  // ── Click-click ───────────────────────────────────────────────
  if (state.selectedPiece === null) {
    if (board[idx] !== currentPlayer) return;
    state.selectedPiece = idx;
    const validMoves = state.gameInstance.getValidMoves(state.gameState);
    state.validDests = validMoves.filter(m => m.from === idx).map(m => m.to);
    renderBoard();
  } else {
    if (idx === state.selectedPiece) {
      state.selectedPiece = null;
      state.validDests = [];
      renderBoard();
    } else if (state.validDests.includes(idx)) {
      const from = state.selectedPiece;
      state.selectedPiece = null;
      state.validDests = [];
      applyMove({ from, to: idx });
    } else if (board[idx] === currentPlayer) {
      state.selectedPiece = idx;
      const validMoves = state.gameInstance.getValidMoves(state.gameState);
      state.validDests = validMoves.filter(m => m.from === idx).map(m => m.to);
      renderBoard();
    } else {
      state.selectedPiece = null;
      state.validDests = [];
      renderBoard();
    }
  }
}

function applyMove(move) {
  state.gameState = state.gameInstance.applyMove(
    state.gameInstance.cloneState(state.gameState),
    move
  );

  renderBoard();

  const result = state.gameInstance.checkResult(state.gameState);
  if (result.over) {
    handleGameOver(result);
    return;
  }

  updateTurnUI();

  if (state.mode === 'ai' && state.gameState.currentPlayer === state.aiPlayer) {
    scheduleAIMove();
  }
}

function scheduleAIMove() {
  state.isAIThinking = true;
  state.selectedPiece = null;
  state.validDests = [];
  renderBoard(); // remove click handlers

  // Show thinking indicator
  document.getElementById('status-text').innerHTML =
    `<span>🤖 Pensando </span><span class="thinking-dots"><span></span><span></span><span></span></span>`;

  // Delay so browser paints before computation
  setTimeout(() => {
    const move = state.ai.getBestMove(state.gameState);
    state.isAIThinking = false;
    if (move !== null) applyMove(move);
  }, 350);
}

// ─── TURN UI ─────────────────────────────────────────────────
function updateTurnUI() {
  const p = state.gameState.currentPlayer;
  document.getElementById('player1-card').classList.toggle('active-turn', p === 1);
  document.getElementById('player2-card').classList.toggle('active-turn', p === 2);

  const name = p === 1 ? state.p1Name : state.p2Name;
  document.getElementById('status-text').textContent = `Vez de ${name}`;
}

// ─── GAME OVER ───────────────────────────────────────────────
function handleGameOver(result) {
  if (result.winner === 1)      state.score[1]++;
  else if (result.winner === 2) state.score[2]++;
  else                          state.score.draw++;

  updateScoreDisplay();

  // Update player card borders
  document.getElementById('player1-card').classList.remove('active-turn');
  document.getElementById('player2-card').classList.remove('active-turn');

  if (result.winner === 1) {
    document.getElementById('player1-card').classList.add('active-turn');
    document.getElementById('status-text').textContent = `${state.p1Name} venceu! 🎉`;
  } else if (result.winner === 2) {
    document.getElementById('player2-card').classList.add('active-turn');
    document.getElementById('status-text').textContent = `${state.p2Name} venceu! 🎉`;
  } else {
    document.getElementById('status-text').textContent = 'Empate! 🤝';
  }

  setTimeout(() => showWinOverlay(result), 700);
}

function showWinOverlay(result) {
  const overlay  = document.getElementById('win-overlay');
  const emoji    = document.getElementById('win-emoji');
  const title    = document.getElementById('win-title');
  const subtitle = document.getElementById('win-subtitle');

  if (result.winner === 1) {
    emoji.textContent    = '🏆';
    title.textContent    = `${state.p1Name} Venceu!`;
    subtitle.textContent = 'Parabéns pela vitória!';
  } else if (result.winner === 2) {
    emoji.textContent    = state.mode === 'ai' ? '🤖' : '🏆';
    title.textContent    = state.mode === 'ai' ? 'A IA Venceu!' : `${state.p2Name} Venceu!`;
    subtitle.textContent = state.mode === 'ai'
      ? 'Boa tentativa! Tente de novo.'
      : 'Parabéns pela vitória!';
  } else {
    emoji.textContent    = '🤝';
    title.textContent    = 'Empate!';
    subtitle.textContent = 'Nenhum alinhamento foi possível.';
  }

  overlay.classList.add('visible');
}

function updateScoreDisplay() {
  document.getElementById('score-p1').textContent   = state.score[1];
  document.getElementById('score-p2').textContent   = state.score[2];
  document.getElementById('score-draw').textContent = state.score.draw;
}

// ─── EVENT LISTENERS ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildHomeScreen();

  // ── Setup back ──
  document.getElementById('btn-setup-back').addEventListener('click', () => showScreen('screen-home'));

  // ── Mode buttons ──
  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      document.getElementById('section-difficulty').style.display =
        state.mode === 'ai' ? 'block' : 'none';
    });
  });

  // ── Difficulty buttons ──
  document.querySelectorAll('[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-diff]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.difficulty = btn.dataset.diff;
    });
  });

  // ── Who starts buttons ──
  document.querySelectorAll('[data-starts]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-starts]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.dataset.starts;
      state.startingPlayer = v === 'random' ? 'random' : Number(v);
    });
  });

  // ── Start button ──
  document.getElementById('btn-start').addEventListener('click', startGame);

  // ── Game: back ──
  document.getElementById('btn-game-back').addEventListener('click', () => {
    state.isAIThinking = false;
    openSetup(state.currentGameDef);
  });

  // ── Game: restart (clears scores too) ──
  document.getElementById('btn-restart').addEventListener('click', () => {
    state.isAIThinking = false;
    state.score = { 1: 0, 2: 0, draw: 0 };
    updateScoreDisplay();
    startRound();
  });

  // ── Win overlay: rematch ──
  document.getElementById('btn-play-again').addEventListener('click', () => {
    document.getElementById('win-overlay').classList.remove('visible');
    // Alternate who starts next round
    state.startingPlayer = state.startingPlayer === 1 ? 2 : 1;
    startRound();
  });

  // ── Win overlay: change setup ──
  document.getElementById('btn-change-setup').addEventListener('click', () => {
    document.getElementById('win-overlay').classList.remove('visible');
    openSetup(state.currentGameDef);
  });
});
