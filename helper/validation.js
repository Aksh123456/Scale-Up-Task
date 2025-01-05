const Joi = require("joi");

const validations = {
  register: Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone_no: Joi.string().length(10).required(),
    phone_code: Joi.string().required(),
    date_of_birth: Joi.date().required(),
  }),

  verifyOtp: Joi.object({
    phone_no: Joi.string().length(10).required(),
    otp: Joi.string().length(6).required(),
  }),

  login: Joi.object({
    phone_code: Joi.string().required(),
    phone_no: Joi.string().length(10).required(),
    // otp: Joi.string().length(6).required(),
  }),
};

module.exports = validations;
