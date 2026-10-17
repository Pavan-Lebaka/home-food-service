/**
 * Higher-order wrapper to catch errors in asynchronous route controllers
 * eliminates repetitive try-catch blocks
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
