---
description: Repository Information Overview
alwaysApply: true
---

# nambik.AI Information

## Summary
nambik.AI is a web application with a React frontend and Express backend that provides role-based dashboards for different user types (admin, student, counselor, volunteer). The application includes authentication functionality with JWT tokens and PostgreSQL database integration.

## Structure
- **frontend/**: React application built with Vite
- **server/**: Express.js backend with PostgreSQL database connection

## Frontend

### Language & Runtime
**Language**: JavaScript (React)
**Version**: React 19.1.1
**Build System**: Vite 7.1.6
**Package Manager**: npm

### Dependencies
**Main Dependencies**:
- react: ^19.1.1
- react-dom: ^19.1.1
- react-router-dom: ^7.9.1
- styled-components: ^6.1.19
- axios: ^1.12.2

**Development Dependencies**:
- @vitejs/plugin-react-swc: ^4.0.1
- eslint: ^9.35.0
- vite: ^7.1.6

### Build & Installation
```bash
cd frontend
npm install
npm run dev    # Development server
npm run build  # Production build
```

### Main Files
- **src/main.jsx**: Application entry point
- **src/App.jsx**: Main component with route definitions
- **src/ProtectedRoute.jsx**: Authentication wrapper component
- **src/pages/**: Page components including LoginPage
- **src/dashboards/**: Role-specific dashboard components

## Backend

### Language & Runtime
**Language**: JavaScript (Node.js)
**Framework**: Express 5.1.0
**Package Manager**: npm

### Dependencies
**Main Dependencies**:
- express: ^5.1.0
- pg: ^8.16.3 (PostgreSQL client)
- bcryptjs: ^3.0.2
- jsonwebtoken: ^9.0.2
- cors: ^2.8.5
- dotenv: ^17.2.2

### Build & Installation
```bash
cd server
npm install
npm start
```

### Main Files
- **index.js**: Server entry point
- **db.js**: PostgreSQL database connection
- **routes/auth.js**: Authentication endpoints

### Database
**Type**: PostgreSQL
**Connection**: Uses environment variables for connection string
**Tables**: Users table with fields for authentication and role-based access