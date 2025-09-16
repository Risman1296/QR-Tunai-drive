require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  dbUrl: process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  qrTtlSeconds: process.env.QR_TTL_SECONDS || 120,
  cspOrigin: process.env.CSP_ORIGIN,
};
