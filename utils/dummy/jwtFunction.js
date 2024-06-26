const jwt = require("jsonwebtoken");
const createToken = (payloud) => {
  const token = jwt.sign({ userId: payloud }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
  return token;
};

module.exports = createToken;
