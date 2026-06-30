# DevRoom

DevRoom is an AI-powered collaborative development workspace designed to make software development more interactive, productive, and team-oriented. It combines real-time communication, collaborative coding, and AI assistance into a single platform so developers can work without switching between multiple tools.

The platform is built around collaborative workspaces where team members can communicate, plan, review code, and work together on shared projects. In the long term, DevRoom aims to bring together human developers and AI as active contributors in the development workflow.

## Overview

DevRoom is intended to become a full-stack environment for:

- Team-based software development
- Pair programming and code reviews
- Hackathons and open-source collaboration
- University and internship projects
- AI-assisted feature development and debugging

## Current Status

The repository now includes both a backend foundation and a modern frontend setup for DevRoom, including:

- User registration and login
- JWT-based authentication
- Cookie-based token storage
- Protected profile access
- Password hashing and validation
- MongoDB integration with Mongoose
- Redis-based token blacklist support
- A React + Vite frontend with Tailwind CSS
- A basic starter UI running in the browser

## Core Features

- 🔐 Secure authentication and user management
- 👥 Workspace-oriented collaboration model
- 💬 Real-time team communication
- 🧑‍💻 Collaborative development workflow
- 🤖 AI-powered coding assistance
- 📝 AI task assignment and support for development workflows
- ⚡ Code generation, debugging, refactoring, and explanations
- 🌐 Scalable full-stack architecture

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Redis for token blacklist handling
- Cookie parser for cookie-based auth
- Express Validator for input validation

### Frontend
- React
- Vite
- Tailwind CSS
- ESLint for code quality

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
```

## Authentication API

The backend currently exposes these auth routes:

- POST /auth/register - Register a new user
- POST /auth/login - Login and receive a JWT token
- GET /auth/profile - Access protected profile information
- GET /auth/logout - Logout the current user

## Getting Started

### 1. Install backend dependencies

```bash
cd Backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../Frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the Backend directory with values for:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
```

### 4. Start the backend

```bash
cd Backend
npm run dev
```

### 5. Start the frontend

```bash
cd Frontend
npm run dev
```

## Vision

Modern software development often requires developers to manage many disconnected tools at once. DevRoom aims to unify communication, coding, and AI assistance into one collaborative environment.

The long-term goal is to evolve DevRoom into an intelligent workspace where humans and AI work together as equal contributors to build software faster and more effectively.

## Future Scope

Planned enhancements include:

- Real-time chat and shared rooms
- Live collaborative editing
- AI assistant integration inside conversations
- Task assignment and workflow automation
- Project dashboards and team management
