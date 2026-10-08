export function notFound(req, res) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

// Express 5 forwards rejected promises from async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = Number(err.status) || 500;
  let message = err.message;
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body must be valid JSON';
  }
  if (status >= 500) {
    console.error(err);
    message = 'Internal server error';
  }
  const body = { error: message };
  if (err.details) body.details = err.details;
  res.status(status).json(body);
}
