/**
 * Chinese Chess Engine
 * Handles board state, move validation, check/checkmate detection
 */

class ChessEngine {
  constructor() {
    this.board = [];
    this.currentPlayer = 'red'; // 'red' or 'black'
    this.moveHistory = [];
    this.initializeBoard();
  }

  initializeBoard() {
    // Standard starting position (red at bottom, black at top)
    const setup = [
      ['bR', 'bN', 'bB', 'bA', 'bK', 'bA', 'bB', 'bN', 'bR'],
      ['', '', '', '', '', '', '', '', ''],
      ['', 'bC', '', '', '', '', '', 'bC', ''],
      ['bP', '', 'bP', '', 'bP', '', 'bP', '', 'bP'],
      ['', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['rP', '', 'rP', '', 'rP', '', 'rP', '', 'rP'],
      ['', 'rC', '', '', '', '', '', 'rC', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['rR', 'rN', 'rB', 'rA', 'rK', 'rA', 'rB', 'rN', 'rR']
    ];
    this.board = setup.map(row => [...row]);
    this.currentPlayer = 'red';
    this.moveHistory = [];
  }

  loadPosition(position) {
    this.board = position.map(row => [...row]);
    this.moveHistory = [];
  }

  getPiece(r, c) {
    if (r < 0 || r > 9 || c < 0 || c > 8) return null;
    return this.board[r][c];
  }

  getPieceColor(piece) {
    if (!piece) return null;
    return piece[0] === 'r' ? 'red' : 'black';
  }

  getPieceType(piece) {
    if (!piece) return null;
    return piece[1];
  }

  isSameColor(p1, p2) {
    if (!p1 || !p2) return false;
    return p1[0] === p2[0];
  }

  // Get all legal moves for a piece at (r, c)
  getLegalMoves(r, c) {
    const piece = this.getPiece(r, c);
    if (!piece) return [];

    const color = this.getPieceColor(piece);
    const type = this.getPieceType(piece);
    let moves = [];

    switch (type) {
      case 'K': moves = this._getKingMoves(r, c, color); break;
      case 'A': moves = this._getAdvisorMoves(r, c, color); break;
      case 'B': moves = this._getBishopMoves(r, c, color); break;
      case 'R': moves = this._getRookMoves(r, c, color); break;
      case 'N': moves = this._getKnightMoves(r, c, color); break;
      case 'C': moves = this._getCannonMoves(r, c, color); break;
      case 'P': moves = this._getPawnMoves(r, c, color); break;
    }

    // Filter out moves that leave own king in check
    return moves.filter(move => {
      const testBoard = this._simulateMove(r, c, move.r, move.c);
      return !this._isKingInCheck(testBoard, color);
    });
  }

  getIllegalMoveReason(fromR, fromC, toR, toC) {
    const piece = this.getPiece(fromR, fromC);
    if (!piece) return 'no_piece';
    if (this.getPieceColor(piece) !== this.currentPlayer) return 'not_your_piece';

    const target = this.getPiece(toR, toC);
    if (target && this.isSameColor(piece, target)) return 'cannot_capture_own';

    const legalMoves = this.getLegalMoves(fromR, fromC);
    const isLegal = legalMoves.some(m => m.r === toR && m.c === toC);
    if (isLegal) return null;

    const type = this.getPieceType(piece);
    const color = this.getPieceColor(piece);

    let geometricValid = false;
    switch (type) {
      case 'K': geometricValid = this._isKingMoveValid(fromR, fromC, toR, toC, color); break;
      case 'A': geometricValid = this._isAdvisorMoveValid(fromR, fromC, toR, toC, color); break;
      case 'B': geometricValid = this._isBishopMoveValid(fromR, fromC, toR, toC, color); break;
      case 'R': geometricValid = this._isRookMoveValid(fromR, fromC, toR, toC); break;
      case 'N': geometricValid = this._isKnightMoveValid(fromR, fromC, toR, toC); break;
      case 'C': geometricValid = this._isCannonMoveValid(fromR, fromC, toR, toC); break;
      case 'P': geometricValid = this._isPawnMoveValid(fromR, fromC, toR, toC, color); break;
    }

    if (!geometricValid) {
      if (type === 'N') {
        const dr = toR - fromR, dc = toC - fromC;
        const offsets = [
          {move: [-2,-1], leg: [-1,0]}, {move: [-2,1], leg: [-1,0]},
          {move: [2,-1], leg: [1,0]}, {move: [2,1], leg: [1,0]},
          {move: [-1,-2], leg: [0,-1]}, {move: [1,-2], leg: [0,-1]},
          {move: [-1,2], leg: [0,1]}, {move: [1,2], leg: [0,1]}
        ];
        for (const o of offsets) {
          if (dr === o.move[0] && dc === o.move[1]) {
            const lr = fromR + o.leg[0], lc = fromC + o.leg[1];
            if (lr >= 0 && lr <= 9 && lc >= 0 && lc <= 8 && this.board[lr][lc] !== '') {
              return 'blocked_knight_leg';
            }
          }
        }
      }
      if (type === 'B') {
        const dr = toR - fromR;
        const dc = toC - fromC;
        if (Math.abs(dr) === 2 && Math.abs(dc) === 2) {
          const eyeR = fromR + dr/2, eyeC = fromC + dc/2;
          if (eyeR >= 0 && eyeR <= 9 && eyeC >= 0 && eyeC <= 8 && this.board[eyeR][eyeC] !== '') {
            return 'blocked_bishop_eye';
          }
        }
      }
      return 'invalid_move';
    }

    const testBoard = this._simulateMove(fromR, fromC, toR, toC);
    if (this._isKingInCheck(testBoard, color)) {
      return 'suicide';
    }

    return 'invalid_move';
  }

  _isKingMoveValid(r, c, toR, toC, color) {
    const dr = Math.abs(toR - r), dc = Math.abs(toC - c);
    if (dr + dc !== 1) return false;
    const palaceRows = color === 'red' ? [7,8,9] : [0,1,2];
    const palaceCols = [3,4,5];
    return palaceRows.includes(toR) && palaceCols.includes(toC);
  }

  _isAdvisorMoveValid(r, c, toR, toC, color) {
    const dr = Math.abs(toR - r), dc = Math.abs(toC - c);
    if (dr !== 1 || dc !== 1) return false;
    const palaceRows = color === 'red' ? [7,8,9] : [0,1,2];
    const palaceCols = [3,4,5];
    return palaceRows.includes(toR) && palaceCols.includes(toC);
  }

  _isBishopMoveValid(r, c, toR, toC, color) {
    const dr = Math.abs(toR - r), dc = Math.abs(toC - c);
    if (dr !== 2 || dc !== 2) return false;
    const eyeR = (r + toR) / 2, eyeC = (c + toC) / 2;
    if (this.board[eyeR][eyeC] !== '') return false;
    if (color === 'red' && toR < 5) return false;
    if (color === 'black' && toR > 4) return false;
    return true;
  }

  _isRookMoveValid(r, c, toR, toC) {
    if (r !== toR && c !== toC) return false;
    const dr = toR === r ? 0 : (toR > r ? 1 : -1);
    const dc = toC === c ? 0 : (toC > c ? 1 : -1);
    let tr = r + dr, tc = c + dc;
    while (tr !== toR || tc !== toC) {
      if (this.board[tr][tc] !== '') return false;
      tr += dr; tc += dc;
    }
    return true;
  }

  _isKnightMoveValid(r, c, toR, toC) {
    const dr = Math.abs(toR - r), dc = Math.abs(toC - c);
    if (!((dr === 2 && dc === 1) || (dr === 1 && dc === 2))) return false;
    const legR = dr === 2 ? (r + toR) / 2 : r;
    const legC = dc === 2 ? (c + toC) / 2 : c;
    return this.board[legR][legC] === '';
  }

  _isCannonMoveValid(r, c, toR, toC) {
    if (r !== toR && c !== toC) return false;
    const dr = toR === r ? 0 : (toR > r ? 1 : -1);
    const dc = toC === c ? 0 : (toC > c ? 1 : -1);
    let tr = r + dr, tc = c + dc;
    let foundPlatform = false;
    while (tr !== toR || tc !== toC) {
      if (this.board[tr][tc] !== '') {
        if (foundPlatform) return false;
        foundPlatform = true;
      }
      tr += dr; tc += dc;
    }
    const target = this.getPiece(toR, toC);
    if (target) {
      return foundPlatform && !this.isSameColor(this.getPiece(r, c), target);
    }
    return !foundPlatform;
  }

  _isPawnMoveValid(r, c, toR, toC, color) {
    const forward = color === 'red' ? -1 : 1;
    const dr = toR - r, dc = toC - c;
    const crossed = color === 'red' ? r <= 4 : r >= 5;
    if (dc === 0 && dr === forward) return true;
    if (crossed && dr === 0 && Math.abs(dc) === 1) return true;
    return false;
  }

  _getKingMoves(r, c, color) {
    const moves = [];
    const directions = [[-1,0],[1,0],[0,-1],[0,1]];
    const palaceRows = color === 'red' ? [7,8,9] : [0,1,2];
    const palaceCols = [3,4,5];

    for (const [dr, dc] of directions) {
      const nr = r + dr, nc = c + dc;
      if (palaceRows.includes(nr) && palaceCols.includes(nc)) {
        const target = this.getPiece(nr, nc);
        if (!target || this.getPieceColor(target) !== color) {
          moves.push({r: nr, c: nc});
        }
      }
    }

    // Check for "facing kings" rule - king can move to face and capture enemy king
    // Only if no pieces between them in same column
    const enemyKingType = color === 'red' ? 'bK' : 'rK';
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.board[row][col] === enemyKingType && col === c) {
          let blocked = false;
          const minR = Math.min(r, row);
          const maxR = Math.max(r, row);
          for (let i = minR + 1; i < maxR; i++) {
            if (this.board[i][c] !== '') { blocked = true; break; }
          }
          if (!blocked) {
            moves.push({r: row, c: c});
          }
        }
      }
    }

    return moves;
  }

  _getAdvisorMoves(r, c, color) {
    const moves = [];
    const directions = [[-1,-1],[-1,1],[1,-1],[1,1]];
    const palaceRows = color === 'red' ? [7,8,9] : [0,1,2];
    const palaceCols = [3,4,5];

    for (const [dr, dc] of directions) {
      const nr = r + dr, nc = c + dc;
      if (palaceRows.includes(nr) && palaceCols.includes(nc)) {
        const target = this.getPiece(nr, nc);
        if (!target || this.getPieceColor(target) !== color) {
          moves.push({r: nr, c: nc});
        }
      }
    }
    return moves;
  }

  _getBishopMoves(r, c, color) {
    const moves = [];
    const directions = [[-2,-2],[-2,2],[2,-2],[2,2]];
    const eyeDirections = [[-1,-1],[-1,1],[1,-1],[1,1]];
    const side = color === 'red' ? 5 : 0; // red: rows 5-9, black: rows 0-4

    for (let i = 0; i < directions.length; i++) {
      const [dr, dc] = directions[i];
      const [er, ec] = eyeDirections[i];
      const nr = r + dr, nc = c + dc;
      const eyeR = r + er, eyeC = c + ec;

      if (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
        // Must stay on own side
        if (color === 'red' && nr < 5) continue;
        if (color === 'black' && nr > 4) continue;
        // Eye must be empty
        if (this.board[eyeR][eyeC] !== '') continue;
        const target = this.getPiece(nr, nc);
        if (!target || this.getPieceColor(target) !== color) {
          moves.push({r: nr, c: nc});
        }
      }
    }
    return moves;
  }

  _getRookMoves(r, c, color) {
    const moves = [];
    const directions = [[-1,0],[1,0],[0,-1],[0,1]];

    for (const [dr, dc] of directions) {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
        const target = this.getPiece(nr, nc);
        if (!target) {
          moves.push({r: nr, c: nc});
        } else {
          if (this.getPieceColor(target) !== color) {
            moves.push({r: nr, c: nc});
          }
          break;
        }
        nr += dr; nc += dc;
      }
    }
    return moves;
  }

  _getKnightMoves(r, c, color) {
    const moves = [];
    const offsets = [
      {move: [-2,-1], leg: [-1,0]}, {move: [-2,1], leg: [-1,0]},
      {move: [2,-1], leg: [1,0]}, {move: [2,1], leg: [1,0]},
      {move: [-1,-2], leg: [0,-1]}, {move: [1,-2], leg: [0,-1]},
      {move: [-1,2], leg: [0,1]}, {move: [1,2], leg: [0,1]}
    ];

    for (const o of offsets) {
      const nr = r + o.move[0], nc = c + o.move[1];
      const lr = r + o.leg[0], lc = c + o.leg[1];

      if (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
        if (this.board[lr][lc] !== '') continue; // leg blocked
        const target = this.getPiece(nr, nc);
        if (!target || this.getPieceColor(target) !== color) {
          moves.push({r: nr, c: nc});
        }
      }
    }
    return moves;
  }

  _getCannonMoves(r, c, color) {
    const moves = [];
    const directions = [[-1,0],[1,0],[0,-1],[0,1]];

    for (const [dr, dc] of directions) {
      let nr = r + dr, nc = c + dc;
      let foundPlatform = false;

      while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
        const target = this.getPiece(nr, nc);
        if (!foundPlatform) {
          if (!target) {
            moves.push({r: nr, c: nc});
          } else {
            foundPlatform = true;
          }
        } else {
          if (target) {
            if (this.getPieceColor(target) !== color) {
              moves.push({r: nr, c: nc});
            }
            break;
          }
        }
        nr += dr; nc += dc;
      }
    }
    return moves;
  }

  _getPawnMoves(r, c, color) {
    const moves = [];
    const forward = color === 'red' ? -1 : 1;
    const crossed = color === 'red' ? r <= 4 : r >= 5;

    // Forward
    const nr = r + forward;
    if (nr >= 0 && nr <= 9) {
      const target = this.getPiece(nr, c);
      if (!target || this.getPieceColor(target) !== color) {
        moves.push({r: nr, c: c});
      }
    }

    // Sideways after crossing river
    if (crossed) {
      for (const dc of [-1, 1]) {
        const nc = c + dc;
        if (nc >= 0 && nc <= 8) {
          const target = this.getPiece(r, nc);
          if (!target || this.getPieceColor(target) !== color) {
            moves.push({r: r, c: nc});
          }
        }
      }
    }

    return moves;
  }

  _simulateMove(fromR, fromC, toR, toC) {
    const newBoard = this.board.map(row => [...row]);
    newBoard[toR][toC] = newBoard[fromR][fromC];
    newBoard[fromR][fromC] = '';
    return newBoard;
  }

  _isKingInCheck(board, color) {
    // Find king position
    const kingType = color === 'red' ? 'rK' : 'bK';
    let kingR, kingC;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === kingType) {
          kingR = r; kingC = c;
          break;
        }
      }
      if (kingR !== undefined) break;
    }

    if (kingR === undefined) return false;

    // Check if any enemy piece can capture the king
    const enemyColor = color === 'red' ? 'black' : 'red';
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = board[r][c];
        if (!piece || this.getPieceColor(piece) !== enemyColor) continue;

        const type = this.getPieceType(piece);
        // Temporarily use board for move generation
        const oldBoard = this.board;
        this.board = board;
        let canCapture = false;

        switch (type) {
          case 'K': {
            // Check "facing kings"
            if (c === kingC) {
              let blocked = false;
              const minR = Math.min(r, kingR);
              const maxR = Math.max(r, kingR);
              for (let i = minR + 1; i < maxR; i++) {
                if (board[i][c] !== '') { blocked = true; break; }
              }
              if (!blocked) canCapture = true;
            }
            break;
          }
          case 'R': {
            if (r === kingR || c === kingC) {
              const dr = r === kingR ? 0 : (kingR > r ? 1 : -1);
              const dc = c === kingC ? 0 : (kingC > c ? 1 : -1);
              let tr = r + dr, tc = c + dc;
              let blocked = false;
              while (tr !== kingR || tc !== kingC) {
                if (board[tr][tc] !== '') { blocked = true; break; }
                tr += dr; tc += dc;
              }
              if (!blocked) canCapture = true;
            }
            break;
          }
          case 'C': {
            if (r === kingR || c === kingC) {
              const dr = r === kingR ? 0 : (kingR > r ? 1 : -1);
              const dc = c === kingC ? 0 : (kingC > c ? 1 : -1);
              let tr = r + dr, tc = c + dc;
              let platformCount = 0;
              while (tr !== kingR || tc !== kingC) {
                if (board[tr][tc] !== '') platformCount++;
                tr += dr; tc += dc;
              }
              if (platformCount === 1) canCapture = true;
            }
            break;
          }
          case 'N': {
            const dr = Math.abs(kingR - r);
            const dc = Math.abs(kingC - c);
            if ((dr === 2 && dc === 1) || (dr === 1 && dc === 2)) {
              // Check leg
              let legR, legC;
              if (dr === 2) { legR = (r + kingR) / 2; legC = c; }
              else { legR = r; legC = (c + kingC) / 2; }
              if (board[legR][legC] === '') canCapture = true;
            }
            break;
          }
          case 'P': {
            const forward = enemyColor === 'red' ? -1 : 1;
            if (kingR === r + forward && kingC === c) canCapture = true;
            const crossed = enemyColor === 'red' ? r <= 4 : r >= 5;
            if (crossed && kingR === r && Math.abs(kingC - c) === 1) canCapture = true;
            break;
          }
          case 'A': {
            const dra = Math.abs(kingR - r);
            const dca = Math.abs(kingC - c);
            if (dra === 1 && dca === 1) {
              const palaceRows = enemyColor === 'red' ? [7,8,9] : [0,1,2];
              const palaceCols = [3,4,5];
              if (palaceRows.includes(kingR) && palaceCols.includes(kingC)) canCapture = true;
            }
            break;
          }
          case 'B': {
            const drb = Math.abs(kingR - r);
            const dcb = Math.abs(kingC - c);
            if (drb === 2 && dcb === 2) {
              const eyeR = (r + kingR) / 2;
              const eyeC = (c + kingC) / 2;
              if (board[eyeR][eyeC] === '') {
                if (enemyColor === 'red' && kingR >= 5) canCapture = true;
                if (enemyColor === 'black' && kingR <= 4) canCapture = true;
              }
            }
            break;
          }
        }

        this.board = oldBoard;
        if (canCapture) return true;
      }
    }
    return false;
  }

  isCheckmate(color) {
    // King is in check and has no legal moves to escape
    if (!this._isKingInCheck(this.board, color)) return false;

    // Check if any piece has any legal move
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = this.getPiece(r, c);
        if (piece && this.getPieceColor(piece) === color) {
          const moves = this.getLegalMoves(r, c);
          if (moves.length > 0) return false;
        }
      }
    }
    return true;
  }

  makeMove(fromR, fromC, toR, toC) {
    const piece = this.getPiece(fromR, fromC);
    if (!piece) return false;
    if (this.getPieceColor(piece) !== this.currentPlayer) return false;

    const legalMoves = this.getLegalMoves(fromR, fromC);
    const isLegal = legalMoves.some(m => m.r === toR && m.c === toC);
    if (!isLegal) return false;

    const captured = this.board[toR][toC];
    this.moveHistory.push({
      from: {r: fromR, c: fromC},
      to: {r: toR, c: toC},
      piece: piece,
      captured: captured,
      player: this.currentPlayer
    });

    this.board[toR][toC] = piece;
    this.board[fromR][fromC] = '';
    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
    return true;
  }

  undoMove() {
    if (this.moveHistory.length === 0) return false;
    const move = this.moveHistory.pop();
    this.board[move.from.r][move.from.c] = move.piece;
    this.board[move.to.r][move.to.c] = move.captured;
    this.currentPlayer = move.player;
    return true;
  }

  // Parse simplified position string
  static parsePosition(str) {
    const board = Array(10).fill(null).map(() => Array(9).fill(''));
    if (!str) return board;
    const rows = str.trim().split('/');
    for (let r = 0; r < 10 && r < rows.length; r++) {
      let c = 0;
      for (const ch of rows[r]) {
        if (ch >= '1' && ch <= '9') {
          c += parseInt(ch);
        } else if (ch >= 'a' && ch <= 'z') {
          // black pieces: prefix with 'b'
          const type = ch.toUpperCase();
          board[r][c] = 'b' + type;
          c++;
        } else if (ch >= 'A' && ch <= 'Z') {
          // red pieces: prefix with 'r'
          board[r][c] = 'r' + ch;
          c++;
        }
      }
    }
    return board;
  }
}

// Export for module use or global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChessEngine;
}
