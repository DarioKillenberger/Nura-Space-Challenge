import { UserCity } from "../types";

// In-memory storage (demo only - would be a database in production)
const users = new Map();
const refreshTokens = new Set();
const userCities = new Map<string, UserCity>();

// Add demo users
users.set("demo@example.com", {
  id: "1",
  email: "demo@example.com",
  password: "password123", // In production: bcrypt.hash(password)
  name: "Demo User",
});

users.set("demo2@example.com", {
  id: "2",
  email: "demo2@example.com",
  password: "password321", // In production: bcrypt.hash(password)
  name: "Second Demo User",
});

/**
 * Find user by email
 */
function findUserByEmail(email: string) {
  return users.get(email) || null;
}

/**
 * Find user by ID
 */
function findUserById(id: string) {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return null;
}

/**
 * Create new user
 */
function createUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  const id = Date.now().toString();
  const user = { id, email, password, name };
  users.set(email, user);
  return user;
}

/**
 * Store refresh token
 */
function saveRefreshToken(token: string) {
  refreshTokens.add(token);
}

/**
 * Check if refresh token is valid
 */
function isValidRefreshToken(token: string) {
  return refreshTokens.has(token);
}

/**
 * Remove refresh token (logout)
 */
function deleteRefreshToken(token: string) {
  refreshTokens.delete(token);
}

function getUserCity(userId: string) {
  return userCities.get(userId) as UserCity | null;
}

function setUserCity(userId: string, city: UserCity) {
  userCities.set(userId, city);
}

export default {
  findUserByEmail,
  findUserById,
  createUser,
  saveRefreshToken,
  isValidRefreshToken,
  deleteRefreshToken,
  getUserCity,
  setUserCity,
};
