const Validator = typeof require !== 'undefined' ? require('../js/validator.js') : (typeof Validator !== 'undefined' ? Validator : null);
const { assertEqual, assertTrue } = typeof require !== 'undefined' ? require('./test-framework.js') : { assertEqual, assertTrue };

function runValidatorTests() {
  const v = new Validator();

  const r1 = v.getHint(0, 0, 1, 1, 'no_piece');
  assertEqual(r1.text, '这里没有棋子哦，请点击自己的棋子。', 'no_piece hint');

  const r2 = v.getHint(0, 0, 1, 1, 'not_your_piece');
  assertEqual(r2.text, '这是对方的棋子，现在轮到红方走棋。', 'not_your_piece hint');

  const r3 = v.getHint(9, 1, 7, 2, 'blocked_knight_leg');
  assertTrue(r3.text.includes('马腿'), 'blocked_knight_leg should mention 马腿');
  assertTrue(Array.isArray(r3.highlight), 'blocked_knight_leg should return highlight coords');

  const r4 = v.getHint(9, 2, 7, 4, 'blocked_bishop_eye');
  assertTrue(r4.text.includes('象眼'), 'blocked_bishop_eye should mention 象眼');

  const r5 = v.getHint(9, 4, 8, 4, 'suicide');
  assertTrue(r5.text.includes('送死') || r5.text.includes('被吃掉'), 'suicide hint');

  const r6 = v.getHint(9, 4, 7, 4, 'invalid_move', 'rK');
  assertTrue(r6.text.includes('九宫') || r6.text.includes('一格'), 'king invalid_move hint');

  const r7 = v.getHint(6, 4, 6, 5, 'invalid_move', 'rP');
  assertTrue(r7.text.includes('过河') || r7.text.includes('向前'), 'pawn invalid_move hint');

  console.log('All validator tests passed');
}

if (typeof window !== 'undefined') {
  window.runValidatorTests = runValidatorTests;
} else {
  runValidatorTests();
}
