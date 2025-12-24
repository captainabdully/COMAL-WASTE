export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission"
      });
    }
    next();
  };
};

// export const allowRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role))
//       return res.status(403).json({ message: "Forbidden: Access denied" });

//     next();
//   };
// };

export const allowRoles = (...allowed) => {
  return (req, res, next) => {
    const userRoles = req.user.roles.map(r => r.toLowerCase());

    const allowedLower = allowed.map(r => r.toLowerCase());

    const hasAccess = userRoles.some(role => allowedLower.includes(role));

    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};
