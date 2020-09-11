const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const UnauthorizedError = require('../errors/unauthorized-error');

const auth = (req, res, next) => {
  if (!req.cookies.jwt) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  let payload;
  const token = req.cookies.jwt;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  req.user = payload;
  next();
};

module.exports = {
  auth,
};
