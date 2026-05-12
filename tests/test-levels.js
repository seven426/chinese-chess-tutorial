const { assertEqual, assertTrue } = typeof require !== 'undefined' ? require('./test-framework.js') : { assertEqual, assertTrue };

let LEVELS;
if (typeof require !== 'undefined') {
  const levelsModule = require('../js/levels.js');
  LEVELS = levelsModule.LEVELS;
}

function runLevelTests() {
  assertEqual(LEVELS.length, 25, 'should have 25 levels');

  for (let i = 0; i < LEVELS.length; i++) {
    assertEqual(LEVELS[i].id, i + 1, `level ${i} should have id ${i+1}`);
  }

  const defensive = LEVELS.filter(l => l.type === 'defensive');
  assertTrue(defensive.length >= 5, 'should have at least 5 defensive levels');

  for (const level of LEVELS) {
    assertTrue(typeof level.position === 'string', `level ${level.id} should have position string`);
    assertTrue(level.position.split('/').length === 10, `level ${level.id} position should have 10 rows`);
  }

  for (const level of LEVELS) {
    assertEqual(level.starSteps.length, 3, `level ${level.id} should have 3 star thresholds`);
  }

  const chapters = new Set(LEVELS.map(l => l.chapter));
  assertEqual(chapters.size, 4, 'should have 4 chapters');

  console.log('All level tests passed');
}

if (typeof window !== 'undefined') {
  window.runLevelTests = runLevelTests;
} else {
  runLevelTests();
}
