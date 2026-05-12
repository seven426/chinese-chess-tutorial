function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`FAIL: ${msg}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
}

function assertTrue(val, msg) {
  if (!val) throw new Error(`FAIL: ${msg}`);
}

function assertIncludes(arr, item, msg) {
  if (!arr.includes(item)) throw new Error(`FAIL: ${msg}`);
}

function assertGreaterThan(actual, threshold, msg) {
  if (!(actual > threshold)) throw new Error(`FAIL: ${msg}\n  Expected > ${threshold}, got ${actual}`);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { assertEqual, assertTrue, assertIncludes, assertGreaterThan };
}
