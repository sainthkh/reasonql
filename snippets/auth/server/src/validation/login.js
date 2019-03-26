const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateLoginInput(email, password) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  email = !isEmpty(email) ? email : "";
  password = !isEmpty(password) ? password : "";

  // Email checks
  if (Validator.isEmpty(email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(email)) {
    errors.email = "Email is invalid";
  }
  // Password checks
  if (Validator.isEmpty(password)) {
    errors.password = "Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
