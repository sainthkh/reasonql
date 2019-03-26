const { UserInputError } = require('apollo-server-express');
const jwt = require("jsonwebtoken");

const { jwtSecret } = require('./config/keys');
const validateLoginInput = require("./validation/login");
const User = require('./model/User');

async function sign(payload) {
  let promise = new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      jwtSecret,
      {
        expiresIn: 31556926 // 1 year in seconds - It's not recommended in production.
      },
      (err, token) => {
        resolve(token);
      }
    );
  });

  return await promise;
}

module.exports = {
  Query: {
    content: function(_, { token }, __) {
      return {
        id: "1234",
        common: "Common content - Hello, GraphQL World!",
        premium: "Premium content - Sign up to see this",
      };
    },
  },
  Mutation: {
    login: async function(_, { email, password }, __) {
      const { errors, isValid } = validateLoginInput(email, password);
      
      if (!isValid) {
        throw new UserInputError("Invalid values.", {
          ...errors,
        });
      }

      // Find user by email
      let user = User.findOne(email);
      // Check if user exists
      if (!user) {
        throw new UserInputError("Email not found", {});
      }

      // Check password
      // It is not recommended in production. Use libraries like bscript. 
      if (password == user.password) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };

        return await sign(payload);
      } else {
        throw new UserInputError("Password incorrect", {});
      }
    },
  }
}