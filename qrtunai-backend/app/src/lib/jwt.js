
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = {
  sign(payload, expiresIn = '1d') {
    return jwt.sign(payload, config.jwtSecret, { expiresIn });
  },
  verify(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (e) {
      return null;
    }
  }
};
