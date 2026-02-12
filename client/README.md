## Client – React SPA

React + TypeScript single‑page app that handles login, lets a user pick a city, shows current weather, and displays real‑time alerts via WebSockets.

### Tech stack

- **React 19**, **TypeScript**, **Vite**
- **react-router-dom** for routing
- **Axios** for HTTP
- **React Bootstrap** for UI

### Run locally

```bash
cd client
npm install
npm run dev
```

By default Vite serves the app on `http://localhost:5173`.

### API and network configuration

- REST base URL is configured in `src/services/axios.ts`:
  - `http://localhost:3000/api`
  - `withCredentials: true` so the browser sends the `refresh_token` cookie.
- WebSockets are configured in `src/services/websocket.ts`:
  - `ws://localhost:8080`

### High‑level architecture

- **main.tsx** – bootstraps React and renders `App`.
- **App.tsx**
  - Wraps everything in `BrowserRouter` and `AuthProvider`.
  - Routes:
    - `/login` → `Login` page
    - `/` → `HomePage` behind `ProtectedRoute` (requires an authenticated user).
- **contexts/AuthContext.tsx**
  - Manages `user` and `loading` state.
  - On mount calls `GET /api/auth/refresh` to pick up an existing session.
  - Exposes `login`, `register`, and `logout` methods used by the UI.
- **pages/Login.tsx**
  - Simple login form using React Bootstrap.
  - Calls `login(email, password)` from the auth context and shows server error messages.
- **pages/Home.tsx**
  - Shows navbar with current user and logout.
  - Renders `CitySelector`, current city label, `WeatherForecast`, and any active alert banner.
  - On mount:
    - Calls `apiService.getCurrentCity()` → `GET /api/user-city`.
    - Connects to WebSocket with the current user identity.
    - Subscribes to WebSocket messages and displays incoming `"alert"` events.

### Client → server API usage

All REST calls go through `src/services/api.ts`, which wraps the shared Axios instance:

- **Auth**
  - `AuthContext` uses:
    - `POST /api/auth/login`
    - `POST /api/auth/register`
    - `GET /api/auth/refresh`
    - `POST /api/auth/logout`
  - Access tokens are stored in memory and attached as `Authorization: Bearer <token>` by an Axios interceptor.

- **Weather + city**
  - `apiService.getCurrentCity()` → `GET /api/user-city`
  - `apiService.setCurrentCity(city)` → `POST /api/user-city`
  - `apiService.getCitiesAutocomplete(query)` → `GET /api/weather/cities-autocomplete?query=<query>`
  - `apiService.getWeather()` → `GET /api/weather`

- **WebSockets**
  - `websocketService.connect({ userId, name, email })` connects to `ws://localhost:8080` and sends a `type: "identify"` payload so the server can route alerts by city.
  - `websocketService.onMessage(handler)` lets the client listen for messages such as:
    - `type: "alert"` with `cityName`, `alertSeverity`, and `alertMessage`, which the UI renders as a temporary alert banner.
