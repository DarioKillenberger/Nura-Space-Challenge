# Fullstack Template

A modern fullstack web application template with a React frontend and Express.js backend, designed to get you up and running in under 12 hours.

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Setup & Run

1. **Clone and navigate to the project:**

   ```bash
   cd fullstack_12hr_template
   ```

2. **Install dependencies for both client and server:**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Start the development servers:**

   **Terminal 1 - Start the backend server:**

   ```bash
   cd server
   npm run dev
   ```

   Server will run on http://localhost:3000

   **Terminal 2 - Start the frontend client:**

   ```bash
   cd client
   npm run dev
   ```

   Client will run on http://localhost:5173

4. **Open your browser** and visit http://localhost:5173

## Tech Stack

### Frontend (Client)

- **React 19** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Axios** - HTTP client for API requests
- **ESLint** - Code linting and formatting

### Backend (Server)

- **Node.js** - JavaScript runtime
- **Express.js 5** - Web framework
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Auto-restart development server

## API Integration

The client is pre-configured to communicate with the backend server:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## Development Workflow

### Adding a New API Endpoint

1. **Server-side** (`server/index.js`):

   ```javascript
   app.get("/api/users", (req, res) => {
     res.json({ users: ["Alice", "Bob"] });
   });
   ```

2. **Client-side** (use the `useFetch` hook):

   ```typescript
   import { useFetch } from "./hooks/useFetch";

   function Users() {
     const { data, loading, error } = useFetch("/users");
     return <div>{/* render users */}</div>;
   }
   ```

### Creating a New Component

1. Create file in `client/src/components/MyComponent.tsx`
2. Export it from `client/src/components/index.ts`
3. Import and use: `import { MyComponent } from './components'`

## Building for Production

### Build the client:

```bash
cd client
npm run build
```

Output will be in `client/dist/`

### Run the server in production:

```bash
cd server
npm start
```
