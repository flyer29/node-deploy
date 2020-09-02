const PasswordValidator = require('password-validator');

const key = 'a06963e97a290c279d1a6eedec59d9000a968e22fdcf239bdc5ec2b1a78b7cae';

const passwordSchema = new PasswordValidator();

passwordSchema
  .is()
  .min(8)
  .has()
  .not()
  .spaces();

module.exports = {
  passwordSchema,
  key,
};
