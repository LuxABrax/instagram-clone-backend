const asyncHandler = fn => (req, res, next) =>
	Promise.resolve(fn(req, res, next)).catch(next);
// Replaces try catch block with next
module.exports = asyncHandler;
