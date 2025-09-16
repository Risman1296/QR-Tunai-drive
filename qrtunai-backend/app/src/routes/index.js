const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to QRTunai Drive-Thru API' });
});

module.exports = router;
