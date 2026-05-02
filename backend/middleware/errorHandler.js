export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: []
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode || 500;

  console.error('Global error handler:', err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode >= 400 ? statusCode : 500).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: err.errors || []
  });
};
