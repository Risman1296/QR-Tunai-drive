// Database connection (MySQL2)
const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config.dbUrl);

module.exports = pool;
