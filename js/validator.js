class Validator {
  constructor() {
    this.reasonMap = {
      'no_piece': { text: '这里没有棋子哦，请点击自己的棋子。' },
      'not_your_piece': { text: '这是对方的棋子，现在轮到红方走棋。' },
      'cannot_capture_own': { text: '不能吃自己的棋子！' },
      'blocked_knight_leg': { text: '马腿被挡住了！马走"日"字时，拐弯的地方不能有棋子。' },
      'blocked_bishop_eye': { text: '象眼被塞住了！象走"田"字时，"田"字正中心不能有棋子。' },
      'suicide': { text: '不能送死哦！走完这步你的将/帅会被对方吃掉。' },
      'invalid_move': null,
    };

    this.pieceHints = {
      'rK': '将/帅只能在九宫内一格一格地移动，横竖都可以。',
      'bK': '将/帅只能在九宫内一格一格地移动。',
      'rA': '仕/士只能在九宫内斜着走一格。',
      'bA': '仕/士只能在九宫内斜着走一格。',
      'rB': '相/象走"田"字，不能过河，且"田"中心不能被堵。',
      'bB': '相/象走"田"字，不能过河，且"田"中心不能被堵。',
      'rR': '車/车可以横竖走任意格，中间不能有棋子阻挡。',
      'bR': '車/车可以横竖走任意格，中间不能有棋子阻挡。',
      'rN': '马/馬走"日"字，注意不能被蹩马腿。',
      'bN': '马/馬走"日"字，注意不能被蹩马腿。',
      'rC': '炮/砲走直线，吃子时必须隔着一个棋子（炮架）。',
      'bC': '炮/砲走直线，吃子时必须隔着一个棋子（炮架）。',
      'rP': '兵/卒只能向前走，过河后才能左右走。',
      'bP': '兵/卒只能向前走，过河后才能左右走。',
    };
  }

  getHint(fromR, fromC, toR, toC, reason, pieceCode = null) {
    if (reason === 'invalid_move' && pieceCode && this.pieceHints[pieceCode]) {
      return {
        text: `走法不对哦！${this.pieceHints[pieceCode]}`,
        highlight: []
      };
    }

    const mapped = this.reasonMap[reason];
    if (mapped) {
      return { text: mapped.text, highlight: [] };
    }

    return { text: '这个走法不对哦，再试试看！', highlight: [] };
  }

  getHighlights(fromR, fromC, toR, toC, reason, board) {
    const highlights = [];

    if (reason === 'blocked_knight_leg') {
      const dr = toR - fromR, dc = toC - fromC;
      const offsets = [
        {move: [-2,-1], leg: [-1,0]}, {move: [-2,1], leg: [-1,0]},
        {move: [2,-1], leg: [1,0]}, {move: [2,1], leg: [1,0]},
        {move: [-1,-2], leg: [0,-1]}, {move: [1,-2], leg: [0,-1]},
        {move: [-1,2], leg: [0,1]}, {move: [1,2], leg: [0,1]}
      ];
      for (const o of offsets) {
        if (dr === o.move[0] && dc === o.move[1]) {
          highlights.push([fromR + o.leg[0], fromC + o.leg[1]]);
        }
      }
    }

    if (reason === 'blocked_bishop_eye') {
      highlights.push([Math.floor((fromR + toR) / 2), Math.floor((fromC + toC) / 2)]);
    }

    if (reason === 'suicide' && board) {
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 9; c++) {
          const p = board[r][c];
          if (p && p[0] === 'b') {
            if (r === toR || c === toC) {
              highlights.push([r, c]);
            }
          }
        }
      }
    }

    return highlights;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validator;
}
