const ChessEngine = typeof require !== 'undefined'
  ? require('../js/chess-engine.js')
  : (typeof ChessEngine !== 'undefined' ? ChessEngine : null);

const { assertEqual, assertTrue } = typeof require !== 'undefined'
  ? require('./test-framework.js')
  : { assertEqual, assertTrue };

function runEngineTests() {
  // Test 1: legal move returns null
  const e1 = new ChessEngine();
  const reason1 = e1.getIllegalMoveReason(9, 4, 8, 4);
  assertEqual(reason1, null, 'legal move should return null');

  // Test 2: no piece at source
  const e2 = new ChessEngine();
  const reason2 = e2.getIllegalMoveReason(5, 5, 4, 5);
  assertEqual(reason2, 'no_piece', 'empty source should return no_piece');

  // Test 3: not your piece (try moving black)
  const e3 = new ChessEngine();
  const reason3 = e3.getIllegalMoveReason(0, 0, 1, 0);
  assertEqual(reason3, 'not_your_piece', 'moving enemy piece should return not_your_piece');

  // Test 4: cannot capture own piece
  const e4 = new ChessEngine();
  e4.board[8][0] = 'rR';
  const reason4 = e4.getIllegalMoveReason(9, 0, 8, 0);
  assertEqual(reason4, 'cannot_capture_own', 'capturing own piece should return cannot_capture_own');

  // Test 5: king leaves palace
  const e5 = new ChessEngine();
  const reason5 = e5.getIllegalMoveReason(9, 4, 7, 4);
  assertEqual(reason5, 'invalid_move', 'king leaving palace should return invalid_move');

  // Test 6: knight blocked (蹩马腿)
  const e6 = new ChessEngine();
  e6.board = Array(10).fill(null).map(() => Array(9).fill(''));
  e6.board[9][1] = 'rN';
  e6.board[8][1] = 'rP';
  e6.currentPlayer = 'red';
  const reason6 = e6.getIllegalMoveReason(9, 1, 7, 2);
  assertEqual(reason6, 'blocked_knight_leg', 'blocked knight leg should return blocked_knight_leg');

  // Test 7: bishop eye blocked (塞象眼)
  const e7 = new ChessEngine();
  e7.board = Array(10).fill(null).map(() => Array(9).fill(''));
  e7.board[9][2] = 'rB';
  e7.board[8][3] = 'rP';
  e7.currentPlayer = 'red';
  const reason7 = e7.getIllegalMoveReason(9, 2, 7, 4);
  assertEqual(reason7, 'blocked_bishop_eye', 'blocked bishop eye should return blocked_bishop_eye');

  // Test 8: suicide (送将)
  const e8 = new ChessEngine();
  e8.board = Array(10).fill(null).map(() => Array(9).fill(''));
  e8.board[9][4] = 'rK';
  e8.board[7][4] = 'bR';
  e8.currentPlayer = 'red';
  const reason8 = e8.getIllegalMoveReason(9, 4, 8, 4);
  assertEqual(reason8, 'suicide', 'moving into check should return suicide');

  console.log('All engine tests passed');
}

if (typeof window !== 'undefined') {
  window.runEngineTests = runEngineTests;
  document.addEventListener('DOMContentLoaded', runEngineTests);
} else {
  runEngineTests();
}
