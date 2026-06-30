# DevRoom

DevRoom is a full-stack starter application for collaborative development workflows with user authentication and a modern React frontend.

This repository includes a Node.js backend with JWT authentication and a React + Vite frontend. The current implementation focuses on user registration, login, profile access, and logout handling with token blacklisting.

## Overview

DevRoom currently provides:

- User registration and login with JWT authentication
- Cookie-based auth token storage
- Protected profile endpoint
- Password hashing and validation
- MongoDB integration using Mongoose
- Redis-based logout token blacklist support
- React frontend with Vite routing for Home, Login, and Register screens

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Redis for logout token blacklist handling
- Cookie Parser for HTTP-only token cookies
- Express Validator for input validation

### Frontend
- React
- Vite
- React Router DOM
- Tailwind CSS
- ESLint

## Project Structure

```text
Backend/
  package.json
  server.js
  src/
    app.js
    config/
      config.js
      db.js
    controller/
      user.controller.js
      redis.service.js
    middleware/
      auth.middleware.js
    model/
      user.model.js
    routes/
      user.route.js
    service/
      user.service.js

Frontend/
  package.json
  index.html
  vite.config.js
  src/
    App.jsx
    main.jsx
    index.css
    routes/
      AppRoutes.jsx
    screens/
      Home.jsx
      Login.jsx
      Register.jsx
```

## API Endpoints

### Authentication routes

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive a JWT cookie and response token
- `GET /auth/profile` - Get the authenticated user profile
- `GET /auth/logout` - Logout and blacklist the current token

## Getting Started

### Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` containing:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
```

Start the backend:

```bash
npm run dev
```

### Frontend setup

```bash
cd Frontend
npm install
npm run dev
```

Open the frontend app in your browser using the Vite local URL shown in the terminal.

## Notes

- The backend uses `cookie-parser` to read the auth token from cookies.
- Logout stores the token in Redis to prevent reuse after logout.
- The frontend currently provides routes for `/`, `/login`, and `/register`.

## Future Improvements

Potential next steps for DevRoom:

- Add live collaboration and chat
- Expand user role and workspace management
- Add task boards and project dashboards
- Integrate AI assistance and code review workflows
- Improve frontend styling and UX
