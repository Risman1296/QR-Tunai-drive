
const db = require('../lib/db');
const crypto = require('crypto');
const config = require('../config');

function signToken(id, exp, outletId) {
  const hmac = crypto.createHmac('sha256', config.jwtSecret);
  hmac.update(`${id}|${exp}|${outletId}`);
  return hmac.digest('hex');
}

module.exports = {
  async generate(outletId) {
    const id = crypto.randomBytes(16).toString('hex');
    const exp = Math.floor(Date.now() / 1000) + Number(config.qrTtlSeconds || 120);
    const token = signToken(id, exp, outletId);
    await db.execute(
      `INSERT INTO qr_tokens (id, outlet_id, expires_at) VALUES (?, ?, FROM_UNIXTIME(?))`,
      [id, outletId, exp]
    );
    return { id, token, expiresIn: config.qrTtlSeconds || 120 };
  },
  async validate(id, token, outletId) {
    const [rows] = await db.execute(`SELECT * FROM qr_tokens WHERE id=? AND outlet_id=?`, [id, outletId]);
    if (!rows.length) return false;
    const exp = Math.floor(new Date(rows[0].expires_at).getTime() / 1000);
    const valid = signToken(id, exp, outletId) === token && exp > Math.floor(Date.now() / 1000);
    return valid;
  },
  async rotate(outletId) {
    // Invalidate all previous tokens for outlet
    await db.execute(`UPDATE qr_tokens SET used_at=NOW() WHERE outlet_id=? AND used_at IS NULL`, [outletId]);
    return true;
  }
};
