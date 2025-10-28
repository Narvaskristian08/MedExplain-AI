import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

/**
 * Generate a JWT token for a user payload
 * @param {Object} payload - e.g. { id, email }
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {Object} decoded payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

/**
 * Extracts Bearer token from Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null}
 */
export const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // remove "Bearer "
  }
  return null;
};

