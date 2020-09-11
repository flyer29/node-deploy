require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { celebrate, Joi, errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');
const { createUser, login } = require('./controllers/users');
const { auth } = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { urlValidation } = require('./config');
const NotFoundError = require('./errors/not-found-error');

const { PORT = 3000 } = process.env;
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
const urlDoesNotExist = () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
};

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(limiter);
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use('/cards', auth, cardsRouter);
app.use('/users', auth, usersRouter);

app.use('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom(urlValidation),
    email: Joi.string().required().email(),
    password: Joi.string().required().alphanum().min(8),
  }),
}), createUser);
app.use('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().alphanum().min(8),
  }),
}), login);
app.use('*', urlDoesNotExist);
app.use(errorLogger);
app.use(errors());
app.use((err, req, res, next) => {
  const {
    statusCode = 500,
    message,
    name,
  } = err;
  if (name === 'ValidationError') {
    res.status(400).send({ message: `${message}` });
    return;
  }
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});
app.listen(PORT);
