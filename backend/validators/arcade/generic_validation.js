
module.exports = async function validateCode(context, code, level, logs) {
  if (!level || !level.expectedOutput) {
    return { passed: true };
  }

  const expected = String(level.expectedOutput).trim();
  const actual = logs.length > 0 ? String(logs[logs.length - 1]).trim() : "undefined";

  if (actual === expected) {
    return { passed: true };
  } else {
    return { 
      passed: false, 
      error: `Expected:
${expected}

Received:
${actual}`
    };
  }
};
