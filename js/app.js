/**
 * Chinese Chess Tutorial - Main Application
 */

const App = {
  engine: null,
  currentLevel: null,
  selectedCell: null,
  legalMoves: [],
  steps: 0,
  startTime: null,
  timerInterval: null,
  hintIndex: 0,
  usedHint: false,
  progress: null,
  lastMove: null,
  turnState: 'USER_TURN',
  validator: null,

  init() {
    this.validator = new Validator();
    this.loadProgress();
    this.bindEvents();
    this.updateMenuStats();
  },

  bindEvents() {
    document.getElementById('btn-start').onclick = () => this.showMap();
    document.getElementById('btn-achievements').onclick = () => this.showAchievements();
    document.getElementById('btn-reset').onclick = () => this.resetProgress();
    document.getElementById('btn-map-back').onclick = () => this.showMenu();
    document.getElementById('btn-game-back').onclick = () => this.showMap();
    document.getElementById('btn-hint').onclick = () => this.showHint();
    document.getElementById('btn-restart').onclick = () => this.restartLevel();
    document.getElementById('btn-undo').onclick = () => this.undoMove();
    document.getElementById('btn-replay').onclick = () => { this.hideModal('victory-modal'); this.restartLevel(); };
    document.getElementById('btn-next-level').onclick = () => {
      this.hideModal('victory-modal');
      const nextId = this.currentLevel.id + 1;
      if (nextId <= LEVELS.length) this.startLevel(nextId);
      else this.showMap();
    };
    document.getElementById('btn-hint-close').onclick = () => this.hideModal('hint-modal');
    document.getElementById('btn-failure-replay').onclick = () => { this.hideModal('failure-modal'); this.restartLevel(); };
    document.getElementById('btn-failure-back').onclick = () => { this.hideModal('failure-modal'); this.showMap(); };
    document.getElementById('btn-ach-back').onclick = () => this.showMenu();
    document.getElementById('chess-board').onclick = (e) => this.onBoardClick(e);
  },

  // ===== SCREEN NAVIGATION =====
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  showMenu() {
    this.stopTimer();
    this.showAIThinking(false);
    this.updateMenuStats();
    this.showScreen('menu-screen');
  },

  showMap() {
    this.renderLevelMap();
    this.showScreen('map-screen');
  },

  showAchievements() {
    this.renderAchievements();
    this.showScreen('achievements-screen');
  },

  // ===== PROGRESS =====
  loadProgress() {
    try {
      const saved = localStorage.getItem('chess-tutorial-progress');
      if (saved) this.progress = JSON.parse(saved);
    } catch (e) { console.error(e); }
    this.progress = this.progress || {
      completedLevels: [], levelStars: {}, levelSteps: {},
      levelAttempts: {}, noHintLevels: [], unlockedAchievements: []
    };
  },

  saveProgress() {
    localStorage.setItem('chess-tutorial-progress', JSON.stringify(this.progress));
  },

  resetProgress() {
    if (!confirm('确定要重置所有进度吗？')) return;
    this.progress = {
      completedLevels: [], levelStars: {}, levelSteps: {},
      levelAttempts: {}, noHintLevels: [], unlockedAchievements: []
    };
    this.saveProgress();
    this.updateMenuStats();
    this.showToast('进度已重置');
  },

  updateMenuStats() {
    const completed = this.progress.completedLevels.length;
    const stars = Object.values(this.progress.levelStars).reduce((a, b) => a + b, 0);
    const achs = this.progress.unlockedAchievements.length;
    document.getElementById('menu-completed').textContent = `${completed}/${LEVELS.length}`;
    document.getElementById('menu-stars').textContent = `${stars}/${LEVELS.length * 3}`;
    document.getElementById('menu-achievements').textContent = `${achs}/${ACHIEVEMENTS.length}`;
  },

  // ===== LEVEL MAP =====
  renderLevelMap() {
    const mapEl = document.getElementById('level-map');
    mapEl.innerHTML = '';
    LEVELS.forEach((level, idx) => {
      const prevCompleted = idx === 0 || this.progress.completedLevels.includes(LEVELS[idx - 1].id);
      const isUnlocked = idx === 0 || prevCompleted || this.progress.completedLevels.includes(level.id);
      const isCompleted = this.progress.completedLevels.includes(level.id);
      const stars = this.progress.levelStars[level.id] || 0;

      const card = document.createElement('div');
      card.className = `level-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`;
      card.innerHTML = `
        <div class="level-num">${level.id}</div>
        <div class="level-card-name">${level.name}</div>
        <div class="level-card-sub">${level.subtitle}</div>
        <div class="level-stars">
          ${[1,2,3].map(i => `<span class="${i <= stars ? '' : 'empty'}">★</span>`).join('')}
        </div>
        ${!isUnlocked ? '<span class="lock-icon">🔒</span>' : ''}
      `;
      if (isUnlocked) {
        card.onclick = () => this.startLevel(level.id);
      }
      mapEl.appendChild(card);
    });
  },

  // ===== GAME START =====
  startLevel(levelId) {
    this.currentLevel = LEVELS.find(l => l.id === levelId);
    if (!this.currentLevel) return;

    this.engine = new ChessEngine();
    const board = ChessEngine.parsePosition(this.currentLevel.position);
    this.engine.loadPosition(board);
    this.engine.currentPlayer = 'red';

    this.steps = 0;
    this.hintIndex = 0;
    this.usedHint = false;
    this.selectedCell = null;
    this.legalMoves = [];
    this.lastMove = null;
    this.turnState = 'USER_TURN';

    // Track attempts
    this.progress.levelAttempts[levelId] = (this.progress.levelAttempts[levelId] || 0) + 1;
    this.saveProgress();

    document.getElementById('level-name').textContent = `${this.currentLevel.id}. ${this.currentLevel.name}`;
    document.getElementById('objective-text').textContent = this.getObjectiveText();
    document.getElementById('level-desc').textContent = this.currentLevel.description;
    this.updateStarsDisplay();
    this.updateStepCounter();
    this.updateHistory();

    this.renderBoard();
    this.startTimer();
    this.showScreen('game-screen');
  },

  restartLevel() {
    if (this.currentLevel) this.startLevel(this.currentLevel.id);
  },

  getObjectiveText() {
    const obj = this.currentLevel.objective;
    switch (obj.type) {
      case 'move_to': return `将${PIECE_NAMES[obj.piece]}移动到目标位置`;
      case 'capture': return `吃掉${PIECE_NAMES[obj.piece]}`;
      case 'capture_all': return `吃掉所有目标棋子`;
      case 'check': return `将军对方的将/帅`;
      case 'checkmate': return `将死对方的将/帅`;
      default: return '完成目标';
    }
  },

  // ===== TIMER =====
  startTimer() {
    this.startTime = Date.now();
    document.getElementById('timer').textContent = '00:00';
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const sec = Math.floor((Date.now() - this.startTime) / 1000);
      document.getElementById('timer').textContent =
        `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  },

  // ===== BOARD RENDERING =====
  renderBoard() {
    const boardEl = document.getElementById('chess-board');
    boardEl.innerHTML = '';

    // Create SVG for board lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'board-svg');
    svg.setAttribute('viewBox', '0 0 416 468');
    svg.setAttribute('width', '416');
    svg.setAttribute('height', '468');

    // Horizontal lines (all 10 rows)
    for (let r = 0; r < 10; r++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', r * 52);
      line.setAttribute('x2', '416');
      line.setAttribute('y2', r * 52);
      line.setAttribute('stroke', 'rgba(139, 90, 43, 0.4)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }

    // Vertical lines - upper half (rows 0-4)
    for (let c = 0; c < 9; c++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', c * 52);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', c * 52);
      line.setAttribute('y2', '208');
      line.setAttribute('stroke', 'rgba(139, 90, 43, 0.4)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }

    // Vertical lines - lower half (rows 5-9)
    for (let c = 0; c < 9; c++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', c * 52);
      line.setAttribute('y1', '260');
      line.setAttribute('x2', c * 52);
      line.setAttribute('y2', '468');
      line.setAttribute('stroke', 'rgba(139, 90, 43, 0.4)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }

    // Palace diagonals
    const addLine = (x1, y1, x2, y2) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', 'rgba(139, 90, 43, 0.4)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    };
    addLine(156, 0, 260, 104);
    addLine(260, 0, 156, 104);
    addLine(156, 364, 260, 468);
    addLine(260, 364, 156, 468);

    boardEl.appendChild(svg);

    // Row labels (0-9) — outside left edge, aligned with horizontal grid lines
    for (let r = 0; r < 10; r++) {
      const label = document.createElement('div');
      label.className = 'coord-label coord-row';
      label.style.left = '4px';
      label.style.top = `${26 + r * 52 - 8}px`;
      label.textContent = r;
      boardEl.appendChild(label);
    }
    // Column labels (0-8) — above top edge, aligned with vertical grid lines
    for (let c = 0; c < 9; c++) {
      const label = document.createElement('div');
      label.className = 'coord-label coord-col';
      label.style.left = `${26 + c * 52 - 8}px`;
      label.style.top = '4px';
      label.textContent = c;
      boardEl.appendChild(label);
    }

    // Last move highlights
    if (this.lastMove) {
      for (const pos of [this.lastMove.from, this.lastMove.to]) {
        const highlight = document.createElement('div');
        highlight.className = 'last-move-highlight';
        highlight.style.left = `${4 + pos.c * 52}px`;
        highlight.style.top = `${4 + pos.r * 52}px`;
        boardEl.appendChild(highlight);
      }
    }

    // Legal move dots
    for (const move of this.legalMoves) {
      const dot = document.createElement('div');
      dot.className = 'legal-move-dot';
      dot.style.left = `${18 + move.c * 52}px`;
      dot.style.top = `${18 + move.r * 52}px`;
      boardEl.appendChild(dot);
    }

    // Target marker for move_to objectives
    if (this.currentLevel && this.currentLevel.objective && this.currentLevel.objective.type === 'move_to') {
      const [tr, tc] = this.currentLevel.objective.target;
      const marker = document.createElement('div');
      marker.className = 'target-marker';
      marker.style.left = `${2 + tc * 52}px`;
      marker.style.top = `${2 + tr * 52}px`;
      boardEl.appendChild(marker);
    }

    // Selection ring
    if (this.selectedCell) {
      const ring = document.createElement('div');
      ring.className = 'selection-ring';
      ring.style.left = `${2 + this.selectedCell.c * 52}px`;
      ring.style.top = `${2 + this.selectedCell.r * 52}px`;
      boardEl.appendChild(ring);
    }

    // Pieces on intersections
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = this.engine.getPiece(r, c);
        if (piece) {
          const pEl = document.createElement('div');
          pEl.className = `piece ${piece[0] === 'r' ? 'red' : 'black'}`;
          pEl.textContent = PIECE_NAMES[piece];
          pEl.style.left = `${4 + c * 52}px`;
          pEl.style.top = `${4 + r * 52}px`;
          boardEl.appendChild(pEl);
        }
      }
    }
  },

  // ===== INTERACTION =====
  onBoardClick(e) {
    const boardEl = document.getElementById('chess-board');
    const rect = boardEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.round((x - 26) / 52);
    const r = Math.round((y - 26) / 52);

    if (r < 0 || r > 9 || c < 0 || c > 8) return;

    if (this.turnState !== 'USER_TURN') return;

    const piece = this.engine.getPiece(r, c);

    // If a piece is selected and this intersection is a legal move
    if (this.selectedCell) {
      const move = this.legalMoves.find(m => m.r === r && m.c === c);
      if (move) {
        this.executeMove(this.selectedCell.r, this.selectedCell.c, r, c);
        return;
      }
      // Illegal move - show reason
      const fromPiece = this.engine.getPiece(this.selectedCell.r, this.selectedCell.c);
      const reason = this.engine.getIllegalMoveReason(this.selectedCell.r, this.selectedCell.c, r, c);
      if (reason) {
        const hint = this.validator.getHint(this.selectedCell.r, this.selectedCell.c, r, c, reason, fromPiece);
        this.showIllegalHint(hint.text, r, c);
        const highlights = this.validator.getHighlights(this.selectedCell.r, this.selectedCell.c, r, c, reason, this.engine.board);
        this.showHighlights(highlights);
      }
      this.clearSelection();
      return;
    }

    // If clicking on own piece, select it
    if (piece && this.engine.getPieceColor(piece) === 'red') {
      if (this.currentLevel.allowedPieces && !this.currentLevel.allowedPieces.includes(piece)) {
        this.showToast('这关只能用指定棋子哦！');
        this.clearSelection();
        return;
      }
      this.selectedCell = { r, c };
      this.legalMoves = this.engine.getLegalMoves(r, c);
      this.renderBoard();
      return;
    }

    this.clearSelection();
  },

  clearSelection() {
    this.selectedCell = null;
    this.legalMoves = [];
    this.renderBoard();
  },

  executeMove(fromR, fromC, toR, toC) {
    const moved = this.engine.makeMove(fromR, fromC, toR, toC);
    if (!moved) return false;

    this.steps++;
    this.lastMove = { from: { r: fromR, c: fromC }, to: { r: toR, c: toC } };
    this.clearSelection();
    this.updateStepCounter();
    this.updateHistory();
    this.playSound(400, 0.05);

    setTimeout(() => {
      if (this.checkVictory()) {
        this.handleVictory();
        return;
      }
      if (this.engine.isCheckmate('black')) {
        if (this.currentLevel.objective.type === 'capture' && this.currentLevel.objective.piece === 'bK') {
          this.handleVictory();
          return;
        }
      }
      // Check stalemate: opponent has no legal moves = win
      let blackHasMoves = false;
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 9; c++) {
          const p = this.engine.board[r][c];
          if (p && p[0] === 'b' && this.engine.getLegalMoves(r, c).length > 0) {
            blackHasMoves = true;
            break;
          }
        }
        if (blackHasMoves) break;
      }
      if (!blackHasMoves) {
        this.handleVictory();
        return;
      }
      this.turnState = 'AI_TURN';
      this.renderBoard();
      this.performAIMove();
    }, 300);

    return true;
  },

  performAIMove() {
    this.showAIThinking(true);

    const depth = this.currentLevel.aiDepth || 1;
    const board = this.engine.board;

    this._fetchBackendMove(board, depth)
      .then(move => {
        this.showAIThinking(false);
        this._executeAIMove(move);
      })
      .catch(err => {
        this.showAIThinking(false);
        this.showToast('无法连接AI后端服务，请确保后端已启动');
        this.turnState = 'USER_TURN';
        console.error('AI backend error:', err);
      });
  },

  _getApiBase() {
    if (window.location.protocol === 'file:') {
      return 'http://localhost:8000';
    }
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  },

  async _fetchBackendMove(board, depth) {
    const urls = [
      `${this._getApiBase()}/api/ai-move`,
      'http://localhost:8000/api/ai-move'
    ];
    let lastError = null;

    for (const url of urls) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            board: board,
            color: 'black',
            level_id: this.currentLevel.id,
            ai_depth: depth,
            engine: 'auto'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) continue;
        const data = await res.json();
        if (data.error || !data.move) continue;
        return data.move;
      } catch (e) {
        clearTimeout(timeoutId);
        lastError = e;
      }
    }
    throw lastError || new Error('All backend URLs failed');
  },

  _executeAIMove(move) {
    if (move) {
      this.engine.makeMove(move.fromR, move.fromC, move.toR, move.toC);
      this.lastMove = { from: { r: move.fromR, c: move.fromC }, to: { r: move.toR, c: move.toC } };
      this.updateHistory();
      this.playSound(300, 0.05);
      this.renderBoard();

      if (this.engine._isKingInCheck(this.engine.board, 'red')) {
        this.showCheckWarning();
      }

      if (this.engine.isCheckmate('red')) {
        this.handleDefeat();
        return;
      }

      if (this.checkDefensiveVictory()) {
        this.handleVictory();
        return;
      }
    }

    if (this.checkImpossible()) {
      this.handleImpossible();
      return;
    }

    this.engine.currentPlayer = 'red';
    this.turnState = 'USER_TURN';
    this.renderBoard();
  },

  playSound(freq, duration) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  },

  // ===== VICTORY CHECKING =====
  checkDefensiveVictory() {
    const obj = this.currentLevel.objective;
    if (!obj) return false;
    if (this.currentLevel.type !== 'defensive') return false;

    switch (obj.type) {
      case 'escape_check':
        return !this.engine._isKingInCheck(this.engine.board, 'red');
      case 'survive_n_moves':
        return this.steps >= obj.n;
      case 'counter_capture':
        if (!this.engine.moveHistory.length) return false;
        const lastMove = this.engine.moveHistory[this.engine.moveHistory.length - 1];
        return lastMove.captured === obj.targetPiece;
      case 'defend_and_check':
        return this.engine._isKingInCheck(this.engine.board, 'black');
    }
    return false;
  },

  checkVictory() {
    const obj = this.currentLevel.objective;
    const e = this.engine;

    if (this.currentLevel.type === 'defensive') {
      return this.checkDefensiveVictory();
    }

    switch (obj.type) {
      case 'move_to': {
        const [tr, tc] = obj.target;
        return e.getPiece(tr, tc) === obj.piece;
      }
      case 'capture': {
        const [tr, tc] = obj.at || [0, 0];
        if (obj.at) {
          // If piece is still there, not captured yet
          if (e.getPiece(tr, tc) === obj.piece) return false;
          // Verify it was actually captured by red in the last move
          if (e.moveHistory.length === 0) return false;
          const lastMove = e.moveHistory[e.moveHistory.length - 1];
          return lastMove.player === 'red' && lastMove.captured === obj.piece;
        }
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 9; c++) {
            if (e.getPiece(r, c) === obj.piece) return false;
          }
        }
        return true;
      }
      case 'capture_all': {
        for (const ptype of obj.pieces) {
          for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
              if (e.getPiece(r, c) === ptype) return false;
            }
          }
        }
        return true;
      }
      case 'check': {
        let hasKing = false;
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 9; c++) {
            const p = e.getPiece(r, c);
            if (p === (obj.targetColor === 'black' ? 'bK' : 'rK')) hasKing = true;
          }
        }
        if (!hasKing) return true;
        return e._isKingInCheck(e.board, obj.targetColor);
      }
      case 'checkmate': {
        let hasKing = false;
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 9; c++) {
            const p = e.getPiece(r, c);
            if (p === (obj.targetColor === 'black' ? 'bK' : 'rK')) hasKing = true;
          }
        }
        if (!hasKing) return true;
        return e.isCheckmate(obj.targetColor);
      }
    }
    return false;
  },

  checkStalemate() {
    // Simple check: if red has no legal moves, show message
    let hasMoves = false;
    for (let r = 0; r < 10 && !hasMoves; r++) {
      for (let c = 0; c < 9 && !hasMoves; c++) {
        const p = this.engine.getPiece(r, c);
        if (p && p[0] === 'r') {
          if (this.engine.getLegalMoves(r, c).length > 0) hasMoves = true;
        }
      }
    }
    if (!hasMoves) {
      this.showToast('没有可走的棋子了，点击重开再试一次！');
    }
  },

  handleDefeat() {
    this.stopTimer();
    this.playSound(200, 0.3);
    setTimeout(() => {
      document.getElementById('failure-title').textContent = '被将死了！';
      document.getElementById('failure-text').textContent = '你的将/帅被将死，这关没能通过。';
      this.showModal('failure-modal');
    }, 500);
  },

  checkImpossible() {
    const obj = this.currentLevel.objective;
    const e = this.engine;

    const pieceExists = (code) => {
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 9; c++) {
          if (e.getPiece(r, c) === code) return true;
        }
      }
      return false;
    };

    const capturedByRed = (code) => {
      if (e.moveHistory.length === 0) return false;
      const lastMove = e.moveHistory[e.moveHistory.length - 1];
      if (lastMove.player !== 'red') return false;
      return lastMove.captured === code;
    };

    // If allowedPieces is restricted and none of them exist, it's impossible
    if (this.currentLevel.allowedPieces) {
      let anyAllowedExists = false;
      for (const code of this.currentLevel.allowedPieces) {
        if (pieceExists(code)) {
          anyAllowedExists = true;
          break;
        }
      }
      if (!anyAllowedExists) return true;
    }

    switch (obj.type) {
      case 'move_to':
        if (!pieceExists(obj.piece)) return true;
        break;
      case 'capture': {
        if (!pieceExists(obj.piece) && !capturedByRed(obj.piece)) return true;
        if (obj.by && !pieceExists(obj.by)) return true;
        break;
      }
      case 'capture_all': {
        for (const ptype of obj.pieces) {
          if (!pieceExists(ptype) && !capturedByRed(ptype)) return true;
        }
        break;
      }
      case 'check':
      case 'checkmate': {
        const kingCode = obj.targetColor === 'black' ? 'bK' : 'rK';
        if (!pieceExists(kingCode)) return true;
        break;
      }
      case 'escape_check':
      case 'survive_n_moves':
        if (!pieceExists('rK')) return true;
        break;
      case 'counter_capture': {
        if (!pieceExists(obj.targetPiece) && !capturedByRed(obj.targetPiece)) return true;
        break;
      }
      case 'defend_and_check':
        if (!pieceExists('rK')) return true;
        break;
    }
    return false;
  },

  handleImpossible() {
    this.stopTimer();
    this.playSound(200, 0.3);
    setTimeout(() => {
      document.getElementById('failure-title').textContent = '任务无法完成';
      document.getElementById('failure-text').textContent = '关键棋子被吃掉，任务目标无法达成了。';
      this.showModal('failure-modal');
    }, 500);
  },

  // ===== VICTORY HANDLING =====
  handleVictory() {
    this.stopTimer();
    this.playSound(523, 0.1);
    setTimeout(() => this.playSound(659, 0.1), 100);
    setTimeout(() => this.playSound(784, 0.1), 200);

    const stars = this.calculateStars();
    const levelId = this.currentLevel.id;

    // Save progress
    if (!this.progress.completedLevels.includes(levelId)) {
      this.progress.completedLevels.push(levelId);
    }
    const prevStars = this.progress.levelStars[levelId] || 0;
    if (stars > prevStars) {
      this.progress.levelStars[levelId] = stars;
    }
    this.progress.levelSteps[levelId] = this.steps;
    if (!this.usedHint && !this.progress.noHintLevels.includes(levelId)) {
      this.progress.noHintLevels.push(levelId);
    }
    this.saveProgress();

    // Check achievements
    const newAchievements = this.checkAchievements();

    // Show victory modal
    const starsEl = document.getElementById('victory-stars');
    starsEl.innerHTML = [1, 2, 3].map(i =>
      `<span class="star big ${i <= stars ? '' : 'empty'}">★</span>`
    ).join('');

    const timeStr = document.getElementById('timer').textContent;
    let statsText = `用时 ${timeStr}，走了 ${this.steps} 步`;
    if (newAchievements.length > 0) {
      statsText += `<br>🏅 解锁成就：${newAchievements.map(a => a.name).join('、')}`;
    }
    document.getElementById('victory-stats').innerHTML = statsText;

    document.getElementById('btn-next-level').style.display =
      levelId < LEVELS.length ? 'inline-block' : 'none';

    this.showModal('victory-modal');
    this.launchConfetti();
  },

  calculateStars() {
    const thresholds = this.currentLevel.starSteps;
    if (this.steps <= thresholds[0]) return 3;
    if (this.steps <= thresholds[1]) return 2;
    return 1;
  },

  updateStarsDisplay() {
    const stars = this.progress.levelStars[this.currentLevel.id] || 0;
    document.getElementById('stars-display').innerHTML = [1, 2, 3].map(i =>
      `<span class="star ${i <= stars ? '' : 'empty'}">★</span>`
    ).join('');
  },

  updateStepCounter() {
    document.getElementById('step-counter').textContent = `步数: ${this.steps}`;
  },

  updateHistory() {
    const el = document.getElementById('move-history');
    const moves = this.engine.moveHistory;
    if (moves.length === 0) {
      el.innerHTML = '<span style="color:#aaa;font-size:0.85rem">还没有走棋...</span>';
      return;
    }
    el.innerHTML = moves.map((m, i) => {
      const name = PIECE_NAMES[m.piece];
      const action = m.captured ? '吃' : '→';
      return `<div class="move-item">${i + 1}. ${name} ${action} (${m.to.r},${m.to.c})</div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  },

  // ===== HINT =====
  showHint() {
    this.usedHint = true;
    const hints = this.currentLevel.hints;
    const text = hints[Math.min(this.hintIndex, hints.length - 1)];
    document.getElementById('hint-text').textContent = text;
    this.showModal('hint-modal');
    this.hintIndex++;
  },

  // ===== UNDO =====
  undoMove() {
    if (this.engine.moveHistory.length === 0) {
      this.showToast('没有可以悔棋的步数');
      return;
    }
    this.engine.undoMove();
    this.steps = Math.max(0, this.steps - 1);
    this.lastMove = this.engine.moveHistory.length > 0
      ? { from: this.engine.moveHistory[this.engine.moveHistory.length - 1].from,
          to: this.engine.moveHistory[this.engine.moveHistory.length - 1].to }
      : null;
    this.clearSelection();
    this.updateStepCounter();
    this.updateHistory();
  },

  // ===== ACHIEVEMENTS =====
  checkAchievements() {
    const newlyUnlocked = [];
    for (const ach of ACHIEVEMENTS) {
      if (this.progress.unlockedAchievements.includes(ach.id)) continue;
      if (ach.condition(this.progress)) {
        this.progress.unlockedAchievements.push(ach.id);
        newlyUnlocked.push(ach);
      }
    }
    if (newlyUnlocked.length > 0) this.saveProgress();
    return newlyUnlocked;
  },

  renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    grid.innerHTML = '';
    for (const ach of ACHIEVEMENTS) {
      const unlocked = this.progress.unlockedAchievements.includes(ach.id);
      const card = document.createElement('div');
      card.className = `achievement-card ${unlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <span class="ach-icon">${ach.icon}</span>
        <div class="ach-info">
          <h4>${ach.name}</h4>
          <p>${ach.desc}</p>
        </div>
      `;
      grid.appendChild(card);
    }
  },

  // ===== CONFETTI =====
  launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';

    const colors = ['#C23A30', '#D4AF37', '#5B8C5A', '#E8D5B7', '#F5F0E8', '#FF6B5B'];
    const particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2, y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 - 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 12,
        life: 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.25;
        p.rot += p.rotSpeed;
        p.life -= 0.006;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      if (alive) requestAnimationFrame(animate);
      else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
    };
    animate();
  },

  showAIThinking(show) {
    const el = document.getElementById('ai-thinking');
    if (show) el.classList.add('active');
    else el.classList.remove('active');
  },

  showIllegalHint(text, boardR, boardC) {
    const bubble = document.getElementById('hint-bubble');
    const textEl = document.getElementById('hint-bubble-text');
    textEl.textContent = text;
    const boardEl = document.getElementById('chess-board');
    const rect = boardEl.getBoundingClientRect();
    const x = rect.left + 26 + boardC * 52;
    const y = rect.top + 26 + boardR * 52;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y - 60}px`;
    bubble.classList.add('active');
    setTimeout(() => bubble.classList.remove('active'), 3000);
  },

  showCheckWarning() {
    const el = document.getElementById('check-warning');
    el.classList.remove('active');
    void el.offsetWidth;
    el.classList.add('active');
    this.showToast('⚠️ 被将军了！快解杀！');
  },

  showHighlights(coords) {
    const boardEl = document.getElementById('chess-board');
    boardEl.querySelectorAll('.illegal-highlight').forEach(el => el.remove());
    for (const [r, c] of coords) {
      const hl = document.createElement('div');
      hl.className = 'illegal-highlight';
      hl.style.left = `${2 + c * 52}px`;
      hl.style.top = `${2 + r * 52}px`;
      boardEl.appendChild(hl);
    }
    setTimeout(() => {
      boardEl.querySelectorAll('.illegal-highlight').forEach(el => el.remove());
    }, 3000);
  },

  // ===== MODAL / TOAST =====
  showModal(id) {
    document.getElementById(id).classList.add('active');
  },
  hideModal(id) {
    document.getElementById(id).classList.remove('active');
  },
  showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  const hash = window.location.hash;
  if (hash.startsWith('#level=')) {
    const levelId = parseInt(hash.replace('#level=', ''), 10);
    if (levelId >= 1 && levelId <= LEVELS.length) {
      App.showScreen('game-screen');
      App.startLevel(levelId);
    }
  }
});
