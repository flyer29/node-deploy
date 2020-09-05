const PasswordValidator = require('password-validator');
const validator = require('validator');
const BadRequestError = require('./errors/bad-request-error');

const passwordSchema = new PasswordValidator();

passwordSchema
  .is()
  .min(8)
  .has()
  .not()
  .spaces();

const urlValidation = ((value) => {
  if (!validator.isURL(value)) {
    throw new BadRequestError('Необходимо указать коррекную ссылку');
  }
  return value;
});

module.exports = {
  passwordSchema,
  urlValidation,
};
