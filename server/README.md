# Server - Resource Planning Backend

A Node.js backend server built with Express.js and SQLite, featuring a RESTful API for resource planning and task management.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js 5** - Web application framework
- **SQLite (better-sqlite3)** - Lightweight, file-based database
- **CORS** - Cross-Origin Resource Sharing middleware
- **Nodemon** - Development auto-restart tool

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Seed the Database

```bash
npm run seed
```

This creates the SQLite database and populates it with initial data (people, projects, tasks, and assignments).

### 3. Start the Server

```bash
npm run dev      # Development mode with auto-reload
npm start        # Production mode
```

The server will be available at **http://localhost:3000**

## Resources used

- Controller - Router - Service layout: https://www.youtube.com/watch?v=7KuGVli6dTk
- Authentication: https://blog.galmalachi.com/react-nodejs-and-jwt-authentication-the-right-way, https://blog.galmalachi.com/react-and-jwt-authentication-the-right-way, Claude
- Weather API: https://open-meteo.com/en/docs/geocoding-api?name=Melbourne
- ws Websockets: https://www.w3schools.com/nodejs/nodejs_websockets.asp
