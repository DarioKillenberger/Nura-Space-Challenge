# Client - Fullstack project management challenge

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API requests
- **ESLint** - Code linting

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

## Getting Started

### 1. Install Dependencies

Navigate to the client directory and install all required packages:

```bash
cd client
npm install
```

### 2. Environment Setup

The client is configured to connect to the backend server at `http://localhost:3000`. If the backend runs on a different port, update the `API_BASE_URL` in `src/services/api.ts`.

### 3. Run the Development Server

Start the Vite development server:

```bash
npm run dev
```

The application will be available at **http://localhost:5173** by default.

Other packages used:

- Bootstrap
- https://www.npmjs.com/package/react-bootstrap-typeahead
- https://nodejs.org/en/learn/getting-started/websocket
