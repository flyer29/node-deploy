const PasswordValidator = require('password-validator');

const passwordSchema = new PasswordValidator();

passwordSchema
  .is()
  .min(8)
  .has()
  .not()
  .spaces();

module.exports = {
  passwordSchema,
};
