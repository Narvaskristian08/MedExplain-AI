// middleware/optionalAuth.js
import { verifyToken, extractToken } from '../utils/jwt.js'; // ← USE THIS

export const optionalAuth = (req, res, next) => {
  const token = extractToken(req); // ← USE extractToken

  console.log("[optionalAuth] Token:", token ? "YES" : "NO");

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token); // ← USE verifyToken() → SAME SECRET
    req.user = { 
      id: decoded.id || decoded._id,
      role: decoded.role || "user"
    };
    console.log("[optionalAuth] Valid user:", req.user.id);
    next();
  } catch (err) {
    console.warn("[optionalAuth] Invalid token:", err.message);
    req.user = null;
    next();
  }
};