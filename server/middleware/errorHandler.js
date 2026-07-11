module.exports = function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
};
