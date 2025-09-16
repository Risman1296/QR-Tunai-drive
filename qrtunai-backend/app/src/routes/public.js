const express = require('express');
const router = express.Router();

// POST /api/qr
router.post('/api/qr', (req, res) => {
  res.json({ id: 'dummy', transactionUrl: '/t/dummy/form', expiresIn: 120 });
});

// POST /api/t/:id/notify-view
router.post('/api/t/:id/notify-view', (req, res) => {
  res.json({ status: 'session bound' });
});

// GET /api/t/:id
router.get('/api/t/:id', (req, res) => {
  res.json({ form: 'meta', valid: true });
});

// POST /api/t/:id/submit
const validate = require('../lib/validate');
router.post('/api/t/:id/submit', (req, res) => {
  const schema = {
    type: { required: true, type: 'string' },
    amount: { required: true, type: 'number' },
    customer_name: { required: true, type: 'string' },
    phone: { required: false, type: 'string' }
  };
  const errors = validate.validateForm(req.body, schema);
  if (errors.length) return res.status(400).json({ errors });
  res.json({ status: 'pending_review', txId: 'dummy' });
});

// GET /api/rt/:channel (SSE real-time status transaksi)
router.get('/api/rt/:channel', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  const channel = req.params.channel;
  // Dummy: kirim status setiap 3 detik
  const interval = setInterval(() => {
    res.write(`event: status\ndata: {"channel":"${channel}","status":"pending_review"}\n\n`);
  }, 3000); // interval SSE, bukan port
  req.on('close', () => clearInterval(interval));
});

// GET /status/:id
router.get('/status/:id', (req, res) => {
  res.json({ status: 'pending_review' });
});

// GET /lokasi, /faq, /syarat-ketentuan
router.get(['/lokasi', '/faq', '/syarat-ketentuan'], (req, res) => {
  res.json({ page: req.path.replace('/', '') });
});

module.exports = router;
