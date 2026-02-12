import jwt from 'jsonwebtoken';

// Use environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-change-in-production';

interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
  [key: string]: any;
}

/**
 * Generate short-lived access token (15 minutes)
 */
export function generateAccessToken(userId: string, userData: Record<string, any> = {}): string {
  return jwt.sign(
    { 
      userId,
      type: 'access',
      ...userData 
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Generate long-lived refresh token (7 days)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { 
      userId,
      type: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify any token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Decode token to get expiration (doesn't verify signature)
 */
export function getTokenExpiration(token: string): number | null {
  const decoded = jwt.decode(token) as any;
  return decoded ? decoded.exp * 1000 : null; // Convert to milliseconds
}
