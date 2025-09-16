
module.exports = (roles = []) => (req, res, next) => {
  if (!req.user || (roles.length && !roles.includes(req.user.role))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
