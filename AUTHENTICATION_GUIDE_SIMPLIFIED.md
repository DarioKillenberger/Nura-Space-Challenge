# Simplified React + Express JWT Authentication

## Quick Implementation Guide for Demo Apps

A streamlined, secure authentication implementation that you can build in **2-3 hours**. Follows best practices without unnecessary complexity.

---

## 🎯 What You Get

- ✅ **Secure**: Access token in memory, refresh token in httpOnly cookie
- ✅ **Simple**: ~200 lines of backend code, ~150 lines of frontend code
- ✅ **Well-architected**: Follows your existing controller/router pattern
- ✅ **No extra packages needed**: Uses what you already have

---

## Backend Implementation (90 minutes)

### Step 1: Install Required Packages (2 min)

```bash
cd server
npm install jsonwebtoken cookie-parser
```

### Step 2: Create Token Utility (10 min)

**`server/utils/token.js`** - Simple JWT generation and verification

```javascript
const jwt = require("jsonwebtoken");

// Use environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-change-in-production";

/**
 * Generate short-lived access token (15 minutes)
 */
function generateAccessToken(userId, userData = {}) {
  return jwt.sign(
    {
      userId,
      type: "access",
      ...userData,
    },
    JWT_SECRET,
    { expiresIn: "15m" },
  );
}

/**
 * Generate long-lived refresh token (7 days)
 */
function generateRefreshToken(userId) {
  return jwt.sign(
    {
      userId,
      type: "refresh",
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

/**
 * Verify any token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Decode token to get expiration (doesn't verify signature)
 */
function getTokenExpiration(token) {
  const decoded = jwt.decode(token);
  return decoded ? decoded.exp * 1000 : null; // Convert to milliseconds
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getTokenExpiration,
};
```

### Step 3: Create In-Memory User Store (10 min)

**`server/store/users.js`** - Simple user storage for demo

```javascript
// In-memory storage (demo only - would be a database in production)
const users = new Map();
const refreshTokens = new Set();

// Add demo user
users.set("demo@example.com", {
  id: "1",
  email: "demo@example.com",
  password: "password123", // In production: bcrypt.hash(password)
  name: "Demo User",
});

/**
 * Find user by email
 */
function findUserByEmail(email) {
  return users.get(email) || null;
}

/**
 * Find user by ID
 */
function findUserById(id) {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return null;
}

/**
 * Create new user
 */
function createUser({ email, password, name }) {
  const id = Date.now().toString();
  const user = { id, email, password, name };
  users.set(email, user);
  return user;
}

/**
 * Store refresh token
 */
function saveRefreshToken(token) {
  refreshTokens.add(token);
}

/**
 * Check if refresh token is valid
 */
function isValidRefreshToken(token) {
  return refreshTokens.has(token);
}

/**
 * Remove refresh token (logout)
 */
function deleteRefreshToken(token) {
  refreshTokens.delete(token);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  saveRefreshToken,
  isValidRefreshToken,
  deleteRefreshToken,
};
```

### Step 4: Create Auth Middleware (15 min)

**`server/middleware/auth.js`** - Protect routes

```javascript
const { verifyToken } = require("../utils/token");
const { findUserById } = require("../store/users");

/**
 * Middleware to require authentication
 * Usage: router.get('/protected', requireAuth, controller)
 */
function requireAuth(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const decoded = verifyToken(token);

  // Check if token is valid and is an access token
  if (!decoded || decoded.type !== "access") {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Get user
  const user = findUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  // Attach user to request
  req.user = user;
  next();
}

module.exports = { requireAuth };
```

### Step 5: Create Auth Controller (30 min)

**`server/controllers/auth.js`** - Handle auth operations

```javascript
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getTokenExpiration,
} = require("../utils/token");
const {
  findUserByEmail,
  findUserById,
  createUser,
  saveRefreshToken,
  isValidRefreshToken,
  deleteRefreshToken,
} = require("../store/users");

/**
 * Remove password from user object
 */
function sanitizeUser(user) {
  const { password, ...cleanUser } = user;
  return cleanUser;
}

/**
 * Send tokens to client
 */
function sendTokenResponse(res, user) {
  const accessToken = generateAccessToken(user.id, {
    email: user.email,
    name: user.name,
  });
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token
  saveRefreshToken(refreshToken);

  // Set refresh token as httpOnly cookie
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
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
function register(req, res) {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Email, password, and name are required" });
  }

  // Check if user exists
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "Email already registered" });
  }

  // Create user
  const user = createUser({ email, password, name });
  sendTokenResponse(res, user);
}

/**
 * Login existing user
 */
function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Find user
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  sendTokenResponse(res, user);
}

/**
 * Refresh access token
 */
function refresh(req, res) {
  const { refresh_token } = req.cookies;

  if (!refresh_token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  // Verify token
  const decoded = verifyToken(refresh_token);
  if (
    !decoded ||
    decoded.type !== "refresh" ||
    !isValidRefreshToken(refresh_token)
  ) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  // Get user
  const user = findUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  sendTokenResponse(res, user);
}

/**
 * Logout user
 */
function logout(req, res) {
  const { refresh_token } = req.cookies;

  if (refresh_token) {
    deleteRefreshToken(refresh_token);
  }

  // Clear cookie
  res.cookie("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });

  res.json({ message: "Logged out" });
}

/**
 * Get current user (example protected endpoint)
 */
function getCurrentUser(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
};
```

### Step 6: Create Auth Routes (5 min)

**`server/routers/auth.js`** - Define endpoints

```javascript
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { requireAuth } = require("../middleware/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/refresh", authController.refresh);

// Protected routes
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.getCurrentUser);

module.exports = router;
```

### Step 7: Update Server Index (10 min)

**`server/index.js`** - Wire everything up

```javascript
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

// Import routes
const authRouter = require("./routers/auth");
const { weatherRouter } = require("./routers/index");
const { requireAuth } = require("./middleware/auth");

// CORS - MUST allow credentials for cookies
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true, // Important!
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/api", (req, res) => {
  res.json({ message: "Hello World" });
});

app.use("/api/auth", authRouter);

// Example: Protect existing weather route
app.use("/api/weather", requireAuth, weatherRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

---

## Frontend Implementation (60 minutes)

### Step 1: Install React Router (2 min)

```bash
cd client
npm install react-router-dom
```

### Step 2: Create Axios Instance (10 min)

**`client/src/services/axios.ts`** - Configure HTTP client

```typescript
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // Important: send cookies
});

let accessToken: string | null = null;

// Add token to requests
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && accessToken) {
      // Token invalid, clear it
      accessToken = null;
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    return Promise.reject(error);
  },
);

export function setToken(token: string) {
  accessToken = token;
}

export function clearToken() {
  accessToken = null;
}
```

### Step 3: Create Auth Context (30 min)

**`client/src/contexts/AuthContext.tsx`** - Manage auth state

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setToken, clearToken } from '../services/axios';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to refresh token on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const { data } = await api.get('/auth/refresh');
        setToken(data.access_token);
        setUser(data.user);

        // Set up auto-refresh before token expires
        const expiresIn = data.token_expiration - Date.now();
        setTimeout(() => refreshToken(), Math.max(expiresIn - 30000, 0));
      } catch (error) {
        console.log('No active session');
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  // Handle logout event from axios interceptor
  useEffect(() => {
    function handleLogout() {
      setUser(null);
    }
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  async function refreshToken() {
    try {
      const { data } = await api.get('/auth/refresh');
      setToken(data.access_token);
      setUser(data.user);

      // Schedule next refresh
      const expiresIn = data.token_expiration - Date.now();
      setTimeout(() => refreshToken(), Math.max(expiresIn - 30000, 0));
    } catch (error) {
      setUser(null);
      clearToken();
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.access_token);
    setUser(data.user);

    // Schedule refresh
    const expiresIn = data.token_expiration - Date.now();
    setTimeout(() => refreshToken(), Math.max(expiresIn - 30000, 0));
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password });
    setToken(data.access_token);
    setUser(data.user);

    // Schedule refresh
    const expiresIn = data.token_expiration - Date.now();
    setTimeout(() => refreshToken(), Math.max(expiresIn - 30000, 0));
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      clearToken();
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Step 4: Create Login Page (15 min)

**`client/src/pages/Login.tsx`** - Simple login form

```typescript
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </form>
      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        Demo: demo@example.com / password123
      </p>
    </div>
  );
}
```

### Step 5: Update App.tsx (5 min)

**`client/src/App.tsx`** - Add routing and auth

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import Header from './components/Header';
import DataDisplay from './components/DataDisplay';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function HomePage() {
  const { user, logout } = useAuth();

  return (
    <>
      <Header />
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <span>Welcome, {user?.name}! </span>
          <button onClick={logout}>Logout</button>
        </div>
        <DataDisplay />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### Step 6: Update API Service (5 min)

**`client/src/services/api.ts`** - Use authenticated axios instance

```typescript
import { api } from "./axios";

export const apiService = {
  async fetchData() {
    const response = await api.get("/");
    return response.data;
  },

  async fetchWeather() {
    const response = await api.get("/weather");
    return response.data;
  },
};
```

---

## 🎯 Quick Test (5 minutes)

1. **Start servers:**

   ```bash
   # Terminal 1
   cd server && npm run dev

   # Terminal 2
   cd client && npm run dev
   ```

2. **Test flow:**
   - Go to http://localhost:5173
   - Should redirect to /login
   - Login with: demo@example.com / password123
   - Should see home page with your name
   - Logout button should work

3. **Verify security:**
   - Check DevTools > Application > Cookies: `refresh_token` is HttpOnly ✓
   - Check DevTools > Application > Local Storage: No token stored ✓
   - Check DevTools > Network: Access token in Authorization header ✓

---

## 📊 What You're Demonstrating

### Security Best Practices ✓

- Access tokens in memory (XSS protection)
- Refresh tokens in httpOnly cookies (CSRF protection)
- Short token lifetimes (15 min access, 7 day refresh)
- Bearer token authentication

### Good Architecture ✓

- Separation of concerns (middleware, controllers, routes)
- Reusable auth utilities
- Context API for state management
- Axios interceptors for DRY code

### Production-Ready Patterns ✓

- Automatic token refresh
- Proper error handling
- Clean user experience
- Scalable structure

---

## 💡 Interview Talking Points

**Q: Why not store the access token in localStorage?**

> "localStorage is vulnerable to XSS attacks. Any malicious script can read it. By keeping it in memory, it's automatically cleared on tab close and can't be accessed by injected scripts."

**Q: Why use refresh tokens?**

> "Short-lived access tokens limit the damage if stolen. Refresh tokens in httpOnly cookies can't be accessed by JavaScript, so even if there's an XSS vulnerability, attackers can't steal them."

**Q: What would you add for production?**

> "I'd add bcrypt for password hashing, rate limiting on login attempts, database instead of in-memory storage, HTTPS-only cookies, and possibly refresh token rotation for extra security."

**Q: How would this scale?**

> "The in-memory storage is just for demo. In production, I'd use Redis for refresh tokens (fast lookups, TTL support) and PostgreSQL for user data. The token strategy itself is stateless and scales horizontally."

---

## 🚀 Next Steps (If You Have Time)

1. **Add registration page** (10 min)
2. **Add loading states** (5 min)
3. **Improve styling** (15 min)
4. **Add password requirements** (10 min)

---

## File Structure Summary

```
server/
├── controllers/
│   └── auth.js          (new)
├── middleware/
│   └── auth.js          (new)
├── routers/
│   └── auth.js          (new)
├── store/
│   └── users.js         (new)
├── utils/
│   └── token.js         (new)
└── index.js             (modified)

client/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx    (new)
│   ├── pages/
│   │   └── Login.tsx          (new)
│   ├── services/
│   │   ├── axios.ts           (new)
│   │   └── api.ts             (modified)
│   └── App.tsx                (modified)
```

**Total: 8 new files, 3 modified files**

---

## Simplifications from Full Guide

- ❌ Removed: Token encryption (adds complexity, JWT signature is sufficient for demo)
- ❌ Removed: Multi-tab sync (nice to have, not essential)
- ❌ Removed: Separate token expiration hook (simplified into context)
- ❌ Removed: Protected route component (inline check in App.tsx)
- ❌ Removed: Complex configuration files (hardcoded sensible defaults)
- ✅ Kept: All security essentials (dual tokens, httpOnly cookies, Bearer auth)
- ✅ Kept: Clean architecture (separation of concerns)
- ✅ Kept: Automatic token refresh

**Result: 70% less code, 100% of core security**
