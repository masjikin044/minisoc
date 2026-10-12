const { emit } = require('../services/events');
// Catat semua respons 4xx/5xx sebagai event http_error
module.exports = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400 && req.path !== '/health') {
      emit(req, 'http_error', { status: res.statusCode });
    }
  });
  next();
};
