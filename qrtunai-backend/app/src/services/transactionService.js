

const db = require('../lib/db');
const audit = require('./auditService');

module.exports = {
  async create(data) {
    const [result] = await db.execute(
      `INSERT INTO transactions (token_id, type, amount, bank, method, customer_name, phone, note, status, evidence_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.token_id, data.type, data.amount, data.bank, data.method, data.customer_name, data.phone, data.note, 'pending_review', data.evidence_url, data.created_by]
    );
    await audit.log(data.created_by, 'create_transaction', result.insertId, data);
    return { id: result.insertId };
  },
  async updateStatus(id, status, actorId) {
    await db.execute(
      `UPDATE transactions SET status=?, updated_at=NOW() WHERE id=?`,
      [status, id]
    );
    await audit.log(actorId, 'update_transaction_status', id, { status });
    return { id, status };
  },
  async list(filter = {}) {
    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    if (filter.status) { sql += ' AND status=?'; params.push(filter.status); }
    if (filter.from) { sql += ' AND created_at>=?'; params.push(filter.from); }
    if (filter.to) { sql += ' AND created_at<=?'; params.push(filter.to); }
    if (filter.outlet) { sql += ' AND created_by IN (SELECT id FROM users WHERE outlet_id=?)'; params.push(filter.outlet); }
    const [rows] = await db.execute(sql, params);
    return rows;
  },
  async cancelBulk(ids, actorId) {
    if (!Array.isArray(ids) || !ids.length) return 0;
    const [result] = await db.query(
      `UPDATE transactions SET status='canceled', updated_at=NOW() WHERE id IN (${ids.map(()=>'?').join(',')})`,
      ids
    );
    await audit.log(actorId, 'cancel_bulk_transaction', ids.join(','), {});
    return result.affectedRows;
  }
};
