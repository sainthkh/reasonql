const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { jwtSecret } = require('../../config/keys');

// Load input validation
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../model/User");

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation

  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  let user = User.findOne(email);
  // Check if user exists
  if (!user) {
    return res.status(404).json({ emailnotfound: "Email not found" });
  }

  // Check password
  // It is not recommended in production. Use libraries like bscript. 
  if (password == user.password) {
    // User matched
    // Create JWT Payload
    const payload = {
      id: user.id,
      name: user.name
    };

    // Sign token
    jwt.sign(
      payload,
      jwtSecret,
      {
        expiresIn: 31556926 // 1 year in seconds
      },
      (err, token) => {
        res.json({
          success: true,
          token: "Bearer " + token
        });
      }
    );
  } else {
    return res
      .status(400)
      .json({ passwordincorrect: "Password incorrect" });
  }
});

module.exports = router;
