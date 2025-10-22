import { verifyToken, extractToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

// Authentication middleware
export const authenticateToken = (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Personnel Verification
export const requireVerified = (req, res, next) => {
  try {
    if (req.user.role === "personnel" && !req.user.verified) {
      logger.warn(`Unverified personnel access attempt: ${req.user._id}`);
      return res.status(403).json({ message: "Personnel must be verified to access this route" });
    }
    next();
  } catch (err) {
    logger.error(`Error in requireVerified middleware: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Restrict History Access
export const restrictHistoryAccess = (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      logger.warn('No user in request for history access');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate accessing user's own history or if admin/personnel
    if (user.id === id || user.role === 'admin' || (user.role === 'personnel' && user.verified)) {
      next();
    } else {
      logger.warn(`Unauthorized history access attempt by user: ${user.id} for userId: ${id}`);
      return res.status(403).json({ message: 'Not authorized to access this user’s history' });
    }
  } catch (err) {
    logger.error(`Error in restrictHistoryAccess middleware: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};