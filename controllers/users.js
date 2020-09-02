const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { passwordSchema, key } = require('../config.js');
const NotFoundError = require('../errors/not-found-error.js');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с таким ID не найден');
      }
      res.send(user);
    })
    .catch(next);
};

const createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  if (password === undefined || !passwordSchema.validate(password)) {
    res.status(400).send({ message: 'Необходимо указать корректный пароль' });
    return;
  }
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
        .then((user) => {
          res.send({
            _id: user._id,
            name: user.name,
            about: user.about,
            avatar: user.avatar,
            email: user.email,
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            res.status(400).send({ message: err.message });
            return;
          }
          if (err.name === 'MongoError' && err.code === 11000) {
            res.status(409).send({ message: 'Пользователь с таким email уже существует' });
            return;
          }
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        key,
        { expiresIn: '7d' },
      );
      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true,
      }).end();
    })
    .catch((err) => {
      if (err.name === 'Error') {
        res.status(401).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about },
    {
      new: true,
      runValidators: true,
      upsert: true,
    })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar },
    {
      new: true,
      runValidators: true,
      upsert: true,
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  login,
};
