// middleware/optionalAuth.js
import jwt from "jsonwebtoken";

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    // No token → guest mode
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    // Invalid token → treat as guest
    req.user = null;
    next();
  }
};