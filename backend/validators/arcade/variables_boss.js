
module.exports = async function validateCode(context, code) {
  if (code.includes('const health')) {
    return { passed: false, error: 'You cannot reassign a const variable. Try using let.' };
  }
  if (context.health === 50) return { passed: true };
  return { passed: false, error: 'Health should be 50.' };
};
