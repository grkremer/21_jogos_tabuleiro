const NS = 'http://www.w3.org/2000/svg';
const SIZE = 300;
const MARGIN = 45;
const STEP = (SIZE - 2 * MARGIN) / 2; // 105

// Point [x, y] for each of the 9 board positions (row-major: a3..c1)
const PTS = [];
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    PTS.push([MARGIN + c * STEP, MARGIN + r * STEP]);
  }
}

const BOARD_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const PIECE_R  = 22;
const SNAP_R   = 36; // snap radius when releasing drag near a point
const DRAG_R   = 20; // ghost piece radius (slightly smaller)

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function toSVGCoords(svg, clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (SIZE / rect.width),
    y: (clientY - rect.top)  * (SIZE / rect.height),
  };
}

function nearestPoint(svgX, svgY, candidates, threshold) {
  let best = null, bestDist = threshold;
  for (const idx of candidates) {
    const [px, py] = PTS[idx];
    const d = Math.hypot(svgX - px, svgY - py);
    if (d < bestDist) { bestDist = d; best = idx; }
  }
  return best;
}

/**
 * Renders the Tapatan/movement board as an inline SVG element.
 *
 * @param {object}        state            - { board, currentPlayer, moveCount }
 * @param {object}        result           - { over, winner, line }
 * @param {function|null} onPositionClick  - (idx) for click, (from, to) for drag-complete
 * @param {object}        uiState          - { selectedPiece, validDests, getValidDestsFor }
 * @returns {SVGSVGElement}
 */
export function renderTapatanBoard(state, result, onPositionClick, uiState = {}) {
  const { selectedPiece = null, validDests = [], getValidDestsFor = null } = uiState;

  const svg = el('svg', { viewBox: `0 0 ${SIZE} ${SIZE}`, class: 'ttt-board', xmlns: NS });
  svg.style.touchAction = 'none'; // prevent scroll-hijack on mobile during drag

  // ── Defs ──────────────────────────────────────────────────────
  const defs = document.createElementNS(NS, 'defs');

  const woodGrad = el('linearGradient', { id: 'tpWood', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
  const ws1 = el('stop', { offset: '0%'   }); ws1.setAttribute('stop-color', '#d4a568');
  const ws2 = el('stop', { offset: '100%' }); ws2.setAttribute('stop-color', '#b8843c');
  woodGrad.appendChild(ws1); woodGrad.appendChild(ws2);
  defs.appendChild(woodGrad);

  const p1Grad = el('linearGradient', { id: 'tpP1', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
  const p1s1 = el('stop', { offset: '0%'   }); p1s1.setAttribute('stop-color', '#f8f8f8');
  const p1s2 = el('stop', { offset: '100%' }); p1s2.setAttribute('stop-color', '#c8c8c8');
  p1Grad.appendChild(p1s1); p1Grad.appendChild(p1s2);
  defs.appendChild(p1Grad);

  const p2Grad = el('linearGradient', { id: 'tpP2', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
  const p2s1 = el('stop', { offset: '0%'   }); p2s1.setAttribute('stop-color', '#484848');
  const p2s2 = el('stop', { offset: '100%' }); p2s2.setAttribute('stop-color', '#141414');
  p2Grad.appendChild(p2s1); p2Grad.appendChild(p2s2);
  defs.appendChild(p2Grad);

  const shadow = el('filter', { id: 'tpShadow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
  const fds = el('feDropShadow', { dx: '0', dy: '2', stdDeviation: '3' });
  fds.setAttribute('flood-color', 'rgba(0,0,0,0.5)');
  shadow.appendChild(fds);
  defs.appendChild(shadow);

  svg.appendChild(defs);

  // ── Background ────────────────────────────────────────────────
  svg.appendChild(el('rect', { width: SIZE, height: SIZE, fill: 'url(#tpWood)', rx: '16' }));

  // ── Win-position highlights ───────────────────────────────────
  if (result.over && result.line) {
    const hlColor = result.winner === 1 ? 'rgba(220,220,220,0.22)' : 'rgba(50,50,50,0.38)';
    for (const idx of result.line) {
      const [cx, cy] = PTS[idx];
      svg.appendChild(el('circle', { cx, cy, r: PIECE_R + 12, fill: hlColor, class: 'cell-win-glow' }));
    }
  }

  // ── Board lines ───────────────────────────────────────────────
  for (const line of BOARD_LINES) {
    const [a, , c] = line;
    const [x1, y1] = PTS[a];
    const [x2, y2] = PTS[c];
    svg.appendChild(el('line', { x1, y1, x2, y2, stroke: '#5c3217', 'stroke-width': '4', 'stroke-linecap': 'round' }));
  }

  // ── Static valid-destination dots (click-click mode) ─────────
  for (const idx of validDests) {
    const [cx, cy] = PTS[idx];
    svg.appendChild(el('circle', {
      cx, cy, r: 9,
      fill: 'rgba(255,255,255,0.25)',
      stroke: 'rgba(255,255,255,0.5)',
      'stroke-width': '2',
      id: `tp-dot-${idx}`,
    }));
  }

  // ── Pieces ────────────────────────────────────────────────────
  for (let i = 0; i < 9; i++) {
    const v = state.board[i];
    if (v === 0) continue;
    const [cx, cy] = PTS[i];
    const isSelected = i === selectedPiece;

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('filter', 'url(#tpShadow)');
    g.setAttribute('id', `tp-piece-${i}`);

    if (isSelected) {
      g.appendChild(el('circle', {
        cx, cy, r: PIECE_R + 7,
        fill: 'none',
        stroke: 'rgba(255,255,255,0.6)',
        'stroke-width': '2.5',
        'stroke-dasharray': '5 3',
      }));
    }

    g.appendChild(el('circle', {
      cx, cy, r: PIECE_R,
      fill: v === 1 ? 'url(#tpP1)' : 'url(#tpP2)',
      stroke: v === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.5)',
      'stroke-width': '1.5',
    }));

    svg.appendChild(g);
  }

  // ── Win line ──────────────────────────────────────────────────
  if (result.over && result.line) {
    const [a, , c] = result.line;
    const [x1, y1] = PTS[a];
    const [x2, y2] = PTS[c];
    svg.appendChild(el('line', {
      x1, y1, x2, y2,
      stroke: result.winner === 1 ? '#f0f0f0' : '#888888',
      'stroke-width': '5',
      'stroke-linecap': 'round',
      class: 'win-line',
      opacity: '0.9',
    }));
  }

  // ── Interaction (drag + click) ────────────────────────────────
  if (onPositionClick && !result.over) {
    attachInteraction(svg, state, onPositionClick, getValidDestsFor, validDests, selectedPiece);
  }

  return svg;
}

// ── Drag & click interaction ──────────────────────────────────────
function attachInteraction(svg, state, onPositionClick, getValidDestsFor, staticValidDests, selectedPiece) {
  // Active drag state — lives outside the event handlers so they share it
  let drag = {
    active:   false,
    moved:    false,
    from:     null,
    dests:    [],
    ghost:    null,
    hoverDest: null,
  };

  // ── Dynamic drag dots (created/removed without re-rendering) ──
  function showDragDots(dests) {
    for (const idx of dests) {
      if (svg.querySelector(`#tp-dragdot-${idx}`)) continue; // already shown via staticValidDests
      const [cx, cy] = PTS[idx];
      const dot = el('circle', {
        cx, cy, r: 10,
        fill: 'rgba(255,255,255,0.28)',
        stroke: 'rgba(255,255,255,0.55)',
        'stroke-width': '2',
        id: `tp-dragdot-${idx}`,
        'pointer-events': 'none',
      });
      svg.appendChild(dot);
    }
  }

  function removeDragDots(dests) {
    for (const idx of dests) {
      const dot = svg.querySelector(`#tp-dragdot-${idx}`);
      if (dot) svg.removeChild(dot);
    }
  }

  function setHoverDest(idx) {
    // Un-highlight previous
    if (drag.hoverDest !== null) {
      const prev = svg.querySelector(`#tp-dragdot-${drag.hoverDest}`) ||
                   svg.querySelector(`#tp-dot-${drag.hoverDest}`);
      if (prev) { prev.setAttribute('r', '10'); prev.setAttribute('fill', 'rgba(255,255,255,0.28)'); }
    }
    drag.hoverDest = idx;
    // Highlight new
    if (idx !== null) {
      const cur = svg.querySelector(`#tp-dragdot-${idx}`) ||
                  svg.querySelector(`#tp-dot-${idx}`);
      if (cur) { cur.setAttribute('r', '14'); cur.setAttribute('fill', 'rgba(255,255,255,0.6)'); }
    }
  }

  function cancelDrag() {
    if (!drag.active) return;
    if (drag.ghost) { svg.removeChild(drag.ghost); drag.ghost = null; }
    removeDragDots(drag.dests);
    const pieceEl = svg.querySelector(`#tp-piece-${drag.from}`);
    if (pieceEl) pieceEl.setAttribute('opacity', '1');
    drag = { active: false, moved: false, from: null, dests: [], ghost: null, hoverDest: null };
  }

  // ── pointerdown ───────────────────────────────────────────────
  svg.addEventListener('pointerdown', (e) => {
    const { x, y } = toSVGCoords(svg, e.clientX, e.clientY);

    // Find which owned piece (or selected piece) was pressed
    let hitIdx = null;
    for (let i = 0; i < 9; i++) {
      const [px, py] = PTS[i];
      if (Math.hypot(x - px, y - py) < SNAP_R) {
        // Owned piece OR a valid destination while one is selected
        if (state.board[i] === state.currentPlayer) { hitIdx = i; break; }
        if (staticValidDests.includes(i))            { hitIdx = i; break; }
        if (selectedPiece !== null && state.board[i] === state.currentPlayer) { hitIdx = i; break; }
      }
    }

    if (hitIdx === null) return;

    // If tapping a valid destination while a piece is selected → treat as click immediately
    if (selectedPiece !== null && staticValidDests.includes(hitIdx) &&
        state.board[hitIdx] !== state.currentPlayer) {
      onPositionClick(hitIdx);
      return;
    }

    // Must be an owned piece to start a drag
    if (state.board[hitIdx] !== state.currentPlayer) return;

    e.preventDefault();
    svg.setPointerCapture(e.pointerId);

    const dests = getValidDestsFor ? getValidDestsFor(hitIdx) : [];
    drag = { active: true, moved: false, from: hitIdx, dests, ghost: null, hoverDest: null };

    // Dim the real piece
    const pieceEl = svg.querySelector(`#tp-piece-${hitIdx}`);
    if (pieceEl) pieceEl.setAttribute('opacity', '0.3');

    // Show destination dots
    showDragDots(dests);

    // Create ghost piece
    const pFill = state.board[hitIdx] === 1 ? 'url(#tpP1)' : 'url(#tpP2)';
    drag.ghost = el('circle', {
      cx: PTS[hitIdx][0], cy: PTS[hitIdx][1], r: DRAG_R,
      fill: pFill,
      opacity: '0.9',
      'pointer-events': 'none',
    });
    svg.appendChild(drag.ghost);
  });

  // ── pointermove ───────────────────────────────────────────────
  svg.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    drag.moved = true;

    const { x, y } = toSVGCoords(svg, e.clientX, e.clientY);

    // Move ghost
    drag.ghost.setAttribute('cx', x);
    drag.ghost.setAttribute('cy', y);

    // Highlight nearest valid destination
    setHoverDest(nearestPoint(x, y, drag.dests, SNAP_R));
  });

  // ── pointerup ─────────────────────────────────────────────────
  svg.addEventListener('pointerup', (e) => {
    if (!drag.active) return;

    const { x, y } = toSVGCoords(svg, e.clientX, e.clientY);
    const { from, dests, moved } = drag;

    cancelDrag();

    if (moved) {
      // Drag: snap to nearest valid destination
      const target = nearestPoint(x, y, dests, SNAP_R);
      if (target !== null) {
        onPositionClick(from, target); // drag completion — 2-arg form
      } else {
        // Dropped nowhere valid → select the piece (show its valid moves)
        onPositionClick(from);
      }
    } else {
      // Quick tap without movement → normal click
      onPositionClick(from);
    }
  });

  // ── pointercancel (system gesture / palm rejection) ───────────
  svg.addEventListener('pointercancel', cancelDrag);
}
