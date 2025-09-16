
const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const router = express.Router();

// Semua endpoint admin harus lewat auth & RBAC
router.use('/admin', auth, rbac(['admin', 'supervisor', 'teller']));

// GET /admin (dashboard KPI & antrean)
router.get('/admin', (req, res) => {
  res.json({ dashboard: true, user: req.user });
});

// GET /admin/transactions
router.get('/admin/transactions', (req, res) => {
  res.json({ transactions: [] });
});

// PATCH /admin/transactions/:txId
const validate = require('../lib/validate');
router.patch('/admin/transactions/:txId', (req, res) => {
  const schema = { status: { required: true, type: 'string' } };
  const errors = validate.validateForm(req.body, schema);
  if (errors.length) return res.status(400).json({ errors });
  res.json({ status: 'updated' });
});

// POST /admin/transactions/cancel-bulk
router.post('/admin/transactions/cancel-bulk', (req, res) => {
  res.json({ status: 'bulk canceled' });
});

// GET /admin/qr
router.get('/admin/qr', (req, res) => {
  res.json({ qr: 'active' });
});

// POST /admin/qr/force-rotate
router.post('/admin/qr/force-rotate', (req, res) => {
  res.json({ status: 'rotated' });
});

// GET /admin/settings
router.get('/admin/settings', (req, res) => {
  res.json({ settings: true });
});

// GET /admin/wifi
router.get('/admin/wifi', (req, res) => {
  res.json({ wifi: [] });
});

// GET /admin/users
router.get('/admin/users', (req, res) => {
  res.json({ users: [] });
});

// GET /admin/outlets
router.get('/admin/outlets', (req, res) => {
  res.json({ outlets: [] });
});

// GET /admin/logs
router.get('/admin/logs', (req, res) => {
  res.json({ logs: [] });
});

// GET /admin/reports
router.get('/admin/reports', (req, res) => {
  res.json({ reports: [] });
});

module.exports = router;
