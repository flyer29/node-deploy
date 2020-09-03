const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');
const { createUser, login } = require('./controllers/users');
const { auth } = require('./middlewares/auth');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const urlDoesNotExist = (req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
};

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/cards', auth, cardsRouter);
app.use('/users', auth, usersRouter);
app.use('/signup', createUser);
app.use('/signin', login);
app.use('*', urlDoesNotExist);
app.use(errors);
app.use((err, req, res, next) => {
  const { statusCode = 500, message, name } = err;
  if (name === 'ValidationError') {
    res.status(400).send({ message: err.message });
    return;
  }
  if (name === 'MongoError') {
    res.status(409).send({ message: 'Пользователь с таким email уже существует' });
    return;
  }
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});
app.listen(PORT);
