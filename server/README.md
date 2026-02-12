## Server – API and WebSocket backend

TypeScript Express server that handles authentication, user city preferences, weather proxying, and alert broadcasting over WebSockets.

### Tech stack

- **Node.js**, **Express 5**, **TypeScript**
- **cors**, **cookie-parser**
- **jsonwebtoken** for access/refresh tokens
- **ws** for the WebSocket server on port **8080**

### Run locally

```bash
cd server
npm install

# development (nodemon + ts-node)
npm run dev

# production-style run
npm start
```

- HTTP API: **http://localhost:3000**
- WebSocket: **ws://localhost:8080**

### Environment

For local development nothing is required, but you can override defaults:

- `JWT_SECRET` – secret used to sign JWTs (defaults to `demo-secret-change-in-production`).

### Architecture

- **index.ts** – sets up Express, CORS, JSON parsing, cookies, and mounts routers:
  - `/api/auth` → `routers/auth.ts` → `controllers/auth.ts`
  - `/api/weather` → `routers/weather.ts` → `controllers/weather.ts` (protected)
  - `/api/user-city` → `routers/weather.ts` → `controllers/weather.ts` (protected)
  - `/api/alerts` → `routers/alerts.ts` → `controllers/alerts.ts`
- **middleware/auth.ts** – `requireAuth` verifies `Authorization: Bearer <accessToken>`, loads the user, and attaches it to `req.user`.
- **store/users.ts** – in‑memory storage for users, refresh tokens, and per‑user city (`UserCity`), plus two built‑in demo users.
- **services/weather.ts** – calls Open‑Meteo geocoding + forecast APIs and shapes responses.
- **services/websocket.ts** – starts the WebSocket server and exposes helpers to broadcast messages to clients (used to send alerts to clients in a given city.)

### REST API

All paths below are relative to `http://localhost:3000/api`.

- **Auth**
  - **POST** `/auth/register`  
    Body: `{ name, email, password }`  
    Returns: `{ access_token, token_expiration, user }` and sets `refresh_token` httpOnly cookie.
  - **POST** `/auth/login`  
    Body: `{ email, password }`  
    Same response as register.
  - **GET** `/auth/refresh`  
    Uses `refresh_token` cookie to issue a new access token.
  - **POST** `/auth/logout` (requires `Authorization: Bearer <accessToken>`)  
    Invalidates the refresh token and clears the cookie.
  - **GET** `/auth/me` (requires auth)  
    Returns `{ user }` for the current access token.

- **Weather and city** (all require `Authorization: Bearer <accessToken>`)
  - **GET** `/weather/cities-autocomplete?query=<string>&count=<number?>`  
    Returns a list of `{ cityName, latitude, longitude }`.
  - **GET** `/weather`  
    Returns current weather for the user’s saved city (Open‑Meteo response shape).
  - **GET** `/user-city`  
    Gets the user’s saved city. `404` if none is set.
  - **POST** `/user-city`  
    Body: `{ cityName, latitude, longitude }`  
    Saves the city for the current user.

- **Alerts**
  - **POST** `/alerts`  
    Body:
    - `cityName` (string, required)
    - `alertSeverity` (`"info" | "warning" | "danger"`, optional, defaults to `"info"`)
    - `alertMessage` (string, required)  
      Sends a WebSocket message to all connected clients whose saved city matches `cityName`.

### WebSocket API

- **URL**: `ws://localhost:8080`
- On connect, the server sends a small welcome message.
- To identify the client (so city‑scoped alerts can be routed), the client sends:

```json
{
  "type": "identify",
  "userId": "<id>",
  "name": "<optional>",
  "email": "<optional>"
}
```

- Alert messages sent from `/api/alerts` arrive as:

```json
{
  "type": "alert",
  "cityName": "Melbourne",
  "alertSeverity": "info" | "warning" | "danger",
  "alertMessage": "Some human-readable message"
}
```
