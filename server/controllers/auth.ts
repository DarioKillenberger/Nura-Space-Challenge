import { Request, Response } from 'express';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken,
  getTokenExpiration
} from '../utils/token';
import usersStore from '../store/users';

/**
 * Remove password from user object
 */
function sanitizeUser(user: any) {
  const { password, ...cleanUser } = user;
  return cleanUser;
}

/**
 * Send tokens to client
 */
function sendTokenResponse(res: Response, user: any) {
  const accessToken = generateAccessToken(user.id, {
    email: user.email,
    name: user.name,
  });
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token
  usersStore.saveRefreshToken(refreshToken);

  // Set refresh token as httpOnly cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Send access token and user in response
  res.json({
    access_token: accessToken,
    token_expiration: getTokenExpiration(accessToken),
    user: sanitizeUser(user),
  });
}

/**
 * Register new user
 */
export function register(req: Request, res: Response) {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  // Check if user exists
  if (usersStore.findUserByEmail(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Create user
  const user = usersStore.createUser({ email, password, name });
  sendTokenResponse(res, user);
}

/**
 * Login existing user
 */
export function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user
  const user = usersStore.findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  sendTokenResponse(res, user);
}

/**
 * Refresh access token
 */
export function refresh(req: Request, res: Response) {
  const { refresh_token } = req.cookies;

  if (!refresh_token) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  // Verify token
  const decoded = verifyToken(refresh_token);
  if (!decoded || decoded.type !== 'refresh' || !usersStore.isValidRefreshToken(refresh_token)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // Get user
  const user = usersStore.findUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  sendTokenResponse(res, user);
}

/**
 * Logout user
 */
export function logout(req: Request, res: Response) {
  const { refresh_token } = req.cookies;

  if (refresh_token) {
    usersStore.deleteRefreshToken(refresh_token);
  }

  // Clear cookie
  res.cookie('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  });

  res.json({ message: 'Logged out' });
}

/**
 * Get current user (example protected endpoint)
 */
export function getCurrentUser(req: Request, res: Response) {
  res.json({ user: sanitizeUser(req.user) });
}
