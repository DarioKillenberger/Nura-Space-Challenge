import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import usersStore from '../store/users';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to require authentication
 * Usage: router.get('/protected', requireAuth, controller)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const decoded = verifyToken(token);

  // Check if token is valid and is an access token
  if (!decoded || decoded.type !== 'access') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Get user
  const user = usersStore.findUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  // Attach user to request
  req.user = user;
  next();
}
