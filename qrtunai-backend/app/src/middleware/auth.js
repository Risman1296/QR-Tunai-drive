
const jwt = require('../lib/jwt');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.split(' ')[1];
  const user = jwt.verify(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
};
