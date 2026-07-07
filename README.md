# DevRoom

DevRoom is a collaborative full-stack project workspace for building and sharing development projects with teammates. It combines authentication, project management, real-time chat, and an in-browser coding experience in a single experience.

## What it includes

### Core features
- User registration and login with JWT authentication
- Protected routes and authenticated project access
- Project creation and team membership management
- Real-time project chat with Socket.IO
- A project workspace with file-tree-based editing
- A browser-based preview runner using WebContainers
- File-tree persistence to the backend database
- Save and run actions inside the project editor UI

### Collaboration features
- Add team members to a project
- View project members from the project screen
- Chat with teammates inside a shared project room
- Work with shared project state across the app

### Developer experience
- Syntax-highlighted code viewing in the editor pane
- Inline markdown rendering for chat messages
- Responsive project screen layout for desktop use
- AI-assisted backend services for project workflows

## Tech stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Redis for token blacklist support
- Socket.IO for real-time communication
- Google Generative AI integration

### Frontend
- React + Vite
- React Router DOM
- Tailwind CSS
- Socket.IO client
- Axios
- Highlight.js and markdown rendering tools
- WebContainer API for running project previews

## Project structure

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
      ai.controller.js
      project.controller.js
      user.controller.js
    middleware/
      auth.middleware.js
    model/
      project.model.js
      user.model.js
    routes/
      ai.routes.js
      project.routes.js
      user.route.js
    service/
      ai.service.js
      project.service.js
      redis.service.js
      user.service.js

Frontend/
  package.json
  index.html
  vite.config.js
  src/
    App.jsx
    main.jsx
    index.css
    auth/
      UserAuth.jsx
    components/
      MarkdownRenderer.jsx
    config/
      axios.js
      socket.js
      webContainer.js
    context/
      User.context.jsx
    routes/
      AppRoutes.jsx
    screens/
      Home.jsx
      Login.jsx
      Project.jsx
      Register.jsx
```

## API highlights

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive a JWT cookie
- `GET /auth/profile` - Fetch the logged-in user profile
- `GET /auth/logout` - Logout and invalidate the current token

### Projects
- `GET /projects/all` - Fetch projects for the current user
- `POST /projects/create` - Create a new project
- `PUT /projects/add-user` - Add users to a project
- `GET /projects/get-project/:projectId` - Fetch a project by ID
- `PUT /projects/update-file-tree` - Save the current file tree for a project

## Getting started

### 1) Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in the Backend folder:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
GOOGLE_API_KEY=your_generative_ai_key
```

Start the backend:

```bash
npm run dev
```

### 2) Frontend setup

```bash
cd Frontend
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Notes

- The backend uses `cookie-parser` to read authentication tokens from cookies.
- Logout tokens are stored in Redis to prevent token reuse after sign-out.
- The project screen supports real-time messaging and a file-based editor experience.

## Future ideas

- Add richer multi-file editing and syntax highlighting support
- Improve collaboration features and permissions
- Expand AI-powered coding assistance
- Add deployment and sharing capabilities
