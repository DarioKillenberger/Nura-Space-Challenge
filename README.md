## Nura Space Challenge

Small full‑stack demo that lets a user log in, pick a city, see current weather, and receive real‑time alerts for that city.

### Folder layout

- **client/**: React + TypeScript SPA (login + weather dashboard, WebSocket alerts).
- **server/**: Express + TypeScript API, JWT auth, WebSocket server, in‑memory user + city storage.

### Requirements

- **Node.js** 18+  
- **npm** (bundled with Node)

### Setup

```bash
cd "Nura Space challenge"

# install backend deps
cd server
npm install

# install frontend deps
cd ../client
npm install
```

### Run in development

Use two terminals:

```bash
# Terminal 1 – API + WebSocket server
cd server
npm run dev      # HTTP on http://localhost:3000, WS on ws://localhost:8080

# Terminal 2 – React app
cd client
npm run dev      # Vite dev server, usually http://localhost:5173
```

Then open the client URL in your browser.

### Demo accounts

You can log in with either of these:

- **Email**: `demo@example.com`, **Password**: `password123`  
- **Email**: `demo2@example.com`, **Password**: `password321`

### High‑level architecture

- **Auth**: `/api/auth/*` endpoints issue short‑lived access tokens (JWT in the `Authorization: Bearer` header) and long‑lived refresh tokens stored as httpOnly cookies.
- **Weather & city**: authenticated user saves a city (`/api/user-city`), then `/api/weather` proxies Open‑Meteo data for that city.
- **Alerts**: a separate WebSocket server (`ws://localhost:8080`) broadcasts alert messages to connected clients based on their saved city.
