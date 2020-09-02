const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cardsRouter = require('./routes/cards.js');
const usersRouter = require('./routes/users.js');
const { createUser, login } = require('./controllers/users.js');
const { auth } = require('./middlewares/auth.js');

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
app.listen(PORT);
