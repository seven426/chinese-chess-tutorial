const ChessEngine = typeof require !== 'undefined' ? require('../js/chess-engine.js') : (typeof ChessEngine !== 'undefined' ? ChessEngine : null);
const AIEngine = typeof require !== 'undefined' ? require('../js/ai-engine.js') : (typeof AIEngine !== 'undefined' ? AIEngine : null);
const { assertTrue, assertGreaterThan, assertEqual } = typeof require !== 'undefined' ? require('./test-framework.js') : { assertTrue, assertGreaterThan, assertEqual };

function runAITests() {
  const ai = new AIEngine();

  // Test 1: evaluate prefers capturing
  const e1 = new ChessEngine();
  e1.board = Array(10).fill(null).map(() => Array(9).fill(''));
  e1.board[9][4] = 'rK';
  e1.board[0][4] = 'bK';
  e1.board[5][4] = 'bR';
  const scoreCapture = ai.evaluate(e1.board, 'black');
  e1.board[5][4] = '';
  const scoreNoCapture = ai.evaluate(e1.board, 'black');
  assertTrue(scoreCapture > scoreNoCapture, 'AI should prefer positions with pieces');

  // Test 2: findBestMove returns a valid move object
  const e2 = new ChessEngine();
  const move = ai.findBestMove(e2, 1, 'black');
  assertTrue(move !== null, 'findBestMove should return a move');
  assertTrue(typeof move.fromR === 'number', 'move should have fromR');
  assertTrue(typeof move.fromC === 'number', 'move should have fromC');
  assertTrue(typeof move.toR === 'number', 'move should have toR');
  assertTrue(typeof move.toC === 'number', 'move should have toC');

  // Test 3: depth 1 is fast and makes a legal move
  const e3 = new ChessEngine();
  const start = Date.now();
  const m3 = ai.findBestMove(e3, 1, 'black');
  const elapsed = Date.now() - start;
  assertTrue(elapsed < 1000, 'depth 1 should be fast (<1s)');
  const legal = e3.getLegalMoves(m3.fromR, m3.fromC);
  const isLegal = legal.some(l => l.r === m3.toR && l.c === m3.toC);
  assertTrue(isLegal, 'AI move should be legal');

  // Test 4: dynamic piece value - cannon > knight in opening
  const cv = ai.getPieceValue('C', 'opening');
  const nv = ai.getPieceValue('N', 'opening');
  assertTrue(cv > nv, 'cannon should be valued higher than knight in opening');

  // Test 5: dynamic piece value - knight > cannon in endgame
  const cvEnd = ai.getPieceValue('C', 'endgame');
  const nvEnd = ai.getPieceValue('N', 'endgame');
  assertTrue(nvEnd > cvEnd, 'knight should be valued higher than cannon in endgame');

  console.log('All AI tests passed');
}

if (typeof window !== 'undefined') {
  window.runAITests = runAITests;
} else {
  runAITests();
}
