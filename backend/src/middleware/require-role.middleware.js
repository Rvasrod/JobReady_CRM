function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para esta acción',
      });
    }
    next();
  };
}

module.exports = requireRole;
