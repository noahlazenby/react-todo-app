# Todo App Backend

This is the backend server for the Todo application, built with Node.js, Express, and Supabase.

## Features

- User authentication (signup, login, logout)
- Todo CRUD operations
- Category filtering for todos
- JWT-based authentication
- Error handling middleware

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

3. Start the server:

   ```
   npm start
   ```

   For development with auto-restart:

   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user info

### Todos

- `GET /api/todos` - Get all todos (with optional category filter)
- `POST /api/todos` - Create a new todo
- `GET /api/todos/:id` - Get a specific todo
- `PATCH /api/todos/:id` - Update a specific todo
- `DELETE /api/todos/:id` - Delete a specific todo

## Project Structure

```
server/
├── config/
│   └── supabase.js
├── controllers/
│   ├── auth.controller.js
│   └── todo.controller.js
├── middleware/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── routes/
│   ├── auth.routes.js
│   └── todo.routes.js
├── utils/
│   ├── appError.js
│   └── catchAsync.js
├── .env
├── .gitignore
├── package.json
└── server.js
```
