if (typeof require !== 'undefined' && typeof ChessEngine === 'undefined') {
  var ChessEngine = require('./chess-engine.js');
}

class AIEngine {
  constructor() {
    this.pieceValues = {
      'K': 10000, 'A': 20, 'B': 20, 'R': 90, 'N': 42, 'C': 45, 'P': 10
    };
  }

  getGamePhase(board) {
    let count = 0;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c]) count++;
      }
    }
    if (count > 20) return 'opening';
    if (count < 10) return 'endgame';
    return 'midgame';
  }

  getPieceValue(type, phase) {
    const base = this.pieceValues[type] || 0;
    if (type === 'C') {
      if (phase === 'opening') return 48;
      if (phase === 'endgame') return 38;
      return 45;
    }
    if (type === 'N') {
      if (phase === 'opening') return 38;
      if (phase === 'endgame') return 48;
      return 42;
    }
    return base;
  }

  evaluate(board, color) {
    const phase = this.getGamePhase(board);
    let score = 0;
    const engine = new ChessEngine();
    engine.board = board;

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        const pColor = piece[0] === 'r' ? 'red' : 'black';
        const type = piece[1];
        const value = this.getPieceValue(type, phase);

        if (pColor === color) {
          score += value;
        } else {
          score -= value;
        }
      }
    }

    const enemyColor = color === 'red' ? 'black' : 'red';
    if (engine._isKingInCheck(board, enemyColor)) {
      score += 500;
    }

    score = score * (1 + (Math.random() - 0.5) * 0.05);
    return score;
  }

  findBestMove(engine, depth, color) {
    const moves = this._getAllMoves(engine, color);
    if (moves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMoves = [];

    for (const move of moves) {
      const newBoard = engine._simulateMove(move.fromR, move.fromC, move.toR, move.toC);
      const score = this._minimax(newBoard, depth - 1, -Infinity, Infinity, false, color);
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    const pickIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[pickIndex];
  }

  _getAllMoves(engine, color) {
    const moves = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = engine.getPiece(r, c);
        if (piece && engine.getPieceColor(piece) === color) {
          const legal = engine.getLegalMoves(r, c);
          for (const m of legal) {
            moves.push({ fromR: r, fromC: c, toR: m.r, toC: m.c });
          }
        }
      }
    }
    return moves;
  }

  _minimax(board, depth, alpha, beta, isMaximizing, aiColor) {
    const engine = new ChessEngine();
    engine.board = board;
    const currentColor = isMaximizing ? aiColor : (aiColor === 'red' ? 'black' : 'red');

    if (depth === 0) {
      return this.evaluate(board, aiColor);
    }

    if (engine.isCheckmate(currentColor)) {
      return isMaximizing ? -10000 : 10000;
    }

    const moves = this._getAllMoves(engine, currentColor);
    if (moves.length === 0) {
      return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const newBoard = engine._simulateMove(move.fromR, move.fromC, move.toR, move.toC);
        const evalScore = this._minimax(newBoard, depth - 1, alpha, beta, false, aiColor);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const newBoard = engine._simulateMove(move.fromR, move.fromC, move.toR, move.toC);
        const evalScore = this._minimax(newBoard, depth - 1, alpha, beta, true, aiColor);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIEngine;
}
