# Kanban Board Application

A modern, full-stack Kanban board application built with Next.js, TypeScript, and PostgreSQL. This application allows users to manage projects and tasks in a visual, drag-and-drop interface.

## Features

- 🔐 User Authentication
  - Secure login system
  - Session management
  - Protected routes

- 📋 Project Management
  - Create, update, and delete projects
  - Project description and details
  - Project organization

- 📝 Task Management
  - Create, update, and delete tasks
  - Drag-and-drop task status updates
  - Task descriptions and details
  - Three-column Kanban board (TODO, DOING, DONE)

- 🎨 Modern UI/UX
  - Clean, responsive design
  - Intuitive drag-and-drop interface
  - Real-time updates
  - Loading states and error handling

## Tech Stack

- **Frontend**
  - Next.js 14
  - TypeScript
  - React
  - CSS Modules
  - NextAuth.js

- **Backend**
  - Next.js API Routes
  - PostgreSQL
  - Prisma ORM

## Prerequisites

### Required Tools
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher) or [yarn](https://yarnpkg.com/) (v1.22 or higher)
- [Docker](https://www.docker.com/) (v24 or higher)
- [Docker Compose](https://docs.docker.com/compose/) (v2 or higher)
- [Git](https://git-scm.com/) (v2 or higher)

### Required Services
- PostgreSQL (will be provided via Docker)

### Recommended Tools
- [Visual Studio Code](https://code.visualstudio.com/) (or any code editor of your choice)
- [Postman](https://www.postman.com/) (for API testing)
- [DBeaver](https://dbeaver.io/) (for database management)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kanban-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   POSTGRES_USER=myuser
   POSTGRES_HOST=localhost
   POSTGRES_DATABASE=mydatabase
   POSTGRES_PASSWORD=mypassword
   POSTGRES_PORT=5432
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up the database**
  At the project root navigate to the docker folder and run the following commands
  ```bash
  cd docker
  docker-compose up -d
  ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Visit `http://localhost:3000` to see the application

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── projects/          # Project pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── kanbanboard/      # Kanban board components
│   ├── modals/           # Modal components
│   ├── providers/        # Context providers
│   └── sidebar/          # Sidebar components
├── lib/                  # Utility functions and services
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Note: 
There were many compromises made in terms of robustness, scalablity and maintainablity as my main goal was to implement has many features as possible given the time I had. :) 