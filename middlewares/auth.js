const jwt = require('jsonwebtoken');
const { key } = require('../config');
const UnauthorizedError = require('../errors/unauthorized-error');

const auth = (req, res, next) => {
  if (!req.cookies.jwt) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  const token = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(token, key);
  } catch (err) {
    const error = new UnauthorizedError('Необходима авторизация');
    next(error);
  }
  req.user = payload;
  return next();
};

module.exports = {
  auth,
};
