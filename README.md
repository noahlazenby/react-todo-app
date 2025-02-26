# React Todo App with Material UI

A modern, responsive Todo application built with React and Material UI that supports both Supabase and a custom Node.js backend.

## Features

- **Dual Backend Support**: Switch between Supabase and a custom Node.js backend
- **User Authentication**: Sign up, login, and logout functionality
- **Todo Management**: Create, read, update, and delete todos
- **Category Support**: Organize todos by categories
- **Material UI Design**: Beautiful and responsive UI with Material Design principles
- **Responsive Layout**: Works on mobile, tablet, and desktop devices

## Tech Stack

### Frontend

- React
- Material UI
- Axios for API requests

### Backend Options

1. **Supabase**

   - Authentication
   - PostgreSQL database
   - Real-time updates

2. **Custom Node.js Backend**
   - Express.js
   - JWT authentication
   - RESTful API
   - PostgreSQL database via Supabase client

## Project Structure

```
react-todo-app/
├── public/
├── server/                   # Node.js backend
│   ├── config/               # Configuration files
│   │   ├── config.js       # Configuration for the frontend
│   │   └── server.js       # Server entry point
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   └── test-simple.js        # Simple test script
├── src/
│   ├── components/           # React components
│   │   ├── Auth.js           # Material UI auth component
│   │   ├── ServerAuth.js     # Auth component for Node.js backend
│   │   ├── SupabaseAuth.js   # Auth component for Supabase
│   │   ├── TodoForm.js       # Form for creating/editing todos
│   │   ├── TodoItem.js       # Individual todo item component
│   │   ├── TodoList.js       # List of todos
│   │   ├── ServerTodoList.js # Todo list for Node.js backend
│   │   └── SupabaseTodoList.js # Todo list for Supabase
│   ├── services/             # Service layer
│   │   └── apiService.js     # API service for backend communication
│   ├── App.js                # Main application component
│   ├── index.js              # Application entry point
│   └── supabaseClient.js     # Supabase client configuration
└── package.json              # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account (for Supabase backend)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd react-todo-app
```

2. Install frontend dependencies

```bash
npm install
```

3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

4. Create a `.env` file in the project root with your Supabase credentials

```
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Create a `.env` file in the server directory

```
PORT=5000
JWT_SECRET=your-jwt-secret
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

### Running the Application

1. Start the frontend

```bash
npm start
```

2. Start the backend (in a separate terminal)

```bash
cd server
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Switch Between Backends**: Use the toggle in the header to switch between Supabase and Node.js backends
2. **Authentication**: Sign up or log in to access the todo application
3. **Create Todos**: Add new todos with the form at the top
4. **Categorize**: Assign categories to your todos
5. **Manage Todos**: Mark todos as complete, edit, or delete them

## Testing

Run the simple test script to verify the backend is working:

```bash
cd server
npm run test:simple
```

## License

MIT
