
const db = require('../lib/db');

module.exports = {
  async log(actorId, action, target, meta) {
    await db.execute(
      `INSERT INTO audit_logs (actor_id, action, target, meta) VALUES (?, ?, ?, ?)` ,
      [actorId, action, target, JSON.stringify(meta || {})]
    );
  },
  async list(filter = {}) {
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    if (filter.actorId) { sql += ' AND actor_id=?'; params.push(filter.actorId); }
    if (filter.action) { sql += ' AND action=?'; params.push(filter.action); }
    const [rows] = await db.execute(sql, params);
    return rows;
  }
};
