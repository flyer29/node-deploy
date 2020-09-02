const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error.js');

const getAllCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch(() => {
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
        return;
      }
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

const deleteCardById = (req, res, next) => {
  Card.findById(req.params.id)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      if (card.owner.toString() !== req.user._id) {
        res.status(403).send({ message: 'Вы не можете удалить эту карточку' });
        return;
      }
      Card.deleteOne(card)
        .then(() => {
          res.send({ message: 'Карточка успешно удалена' });
        })
        .catch(() => {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        });
    })
    .catch(next);
  /* .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Ошибка валидации переданного идентификатора' });
        return;
      }
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    }); */
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.send({ data: card });
    })
    .catch(next);
/* .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Ошибка валидации переданного идентификатора' });
        return;
      }
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    }); */
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.send({ data: card });
    })
    .catch(next);
  /* .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Ошибка валидации переданного идентификатора' });
        return;
      }
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    }); */
};

module.exports = {
  getAllCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
