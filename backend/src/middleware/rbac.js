/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts endpoint access strictly to specified user roles.
 * Returns HTTP 403 Forbidden with descriptive message if role is unauthorized.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated user',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { authorize };
