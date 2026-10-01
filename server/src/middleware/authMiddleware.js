import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'krishisakshi_secure_jwt_dev_secret_key_2026';

/**
 * Authenticates JWT token from Authorization header
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { message: 'Authentication required. No authorization token provided.' }
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { message: 'Invalid or expired session token.' }
    });
  }
}

/**
 * Optional authentication - extracts user if token provided, but does not block if omitted
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore token verification errors for optional routes
    }
  }
  next();
}

/**
 * Enforces role authorization (FARMER | OFFICER)
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { message: 'Authentication required.' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: { message: `Access denied. Role ${req.user.role} is not authorized for this resource.` }
      });
    }

    next();
  };
}

/**
 * Helper to mask phone numbers as 99999XXXXX
 */
export function maskPhone(phone) {
  if (!phone) return '99999XXXXX';
  const str = String(phone).trim();
  if (str.length >= 5) {
    return str.substring(0, 5) + 'XXXXX';
  }
  return '99999XXXXX';
}
