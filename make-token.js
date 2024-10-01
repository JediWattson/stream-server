require("dotenv").config();

const jwt = require("jsonwebtoken");

const payload = {
  userId: 12345,
  email: "user@example.com",
  isAdmin: true,
};

const secretKey = process.env.TOKEN_SECRET;

const options = {
  expiresIn: "1h",
};

const token = jwt.sign(payload, secretKey, options);
console.log(token);
