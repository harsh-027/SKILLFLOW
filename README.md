# SkillFlow

SkillFlow is a full-stack skill-sharing and growth platform built for learners, builders, and collaborators. It combines community posting, profile-based skill discovery, swap requests, direct messaging, and dashboard-driven growth in one workspace.

This README intentionally leaves out sensitive local configuration, private keys, and any secret setup details.

## Features

- User registration and login flows
- Profile management with offered and wanted skills
- Community feed with posts, likes, and comments
- Skill swap request management
- Direct messaging between users
- Personal dashboard with activity and profile insights

## Tech Stack

### Frontend

- React 18
- Vite
- TypeScript and JavaScript
- React Router
- Tailwind CSS
- Framer Motion
- Axios

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs

## Project Structure

```text
skillflow/
|-- frontend/           # Frontend app and Vite configuration
|   |-- src/            # Main Vite frontend app
|   |-- app/            # Additional app-layer UI files
|   |-- components/     # Shared UI components outside src
|   |-- lib/            # Shared helpers outside src
|   |-- index.html      # Vite entry document
|   |-- package.json    # Frontend scripts and dependencies
|   |-- vite.config.js  # Vite configuration
|-- backend/            # Express API and backend services
|   |-- controllers/    # Route controllers
|   |-- routes/         # API route definitions
|   |-- services/       # Backend service logic
|   |-- models/         # Mongoose models
|   |-- package.json    # Backend scripts and dependencies
|   |-- server.js       # Backend entry point
|-- package.json        # Root convenience scripts for frontend/backend
|-- README.md
```

## Main App Areas

- Landing page for onboarding and navigation
- Dashboard for profile progress, posts, and quick actions
- Community page for publishing updates and engaging with posts
- Requests page for managing swap activity
- Messages page for direct user conversations

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Start the frontend

```bash
npm run dev
```

Run that command from `frontend/`, or from the project root with the root script:

```bash
npm run dev
```

The frontend runs with Vite, typically at `http://localhost:5173`.

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Start the backend

```bash
npm run dev
```

Run that command from `backend/`, or from the project root with:

```bash
npm run dev:backend
```

The API is configured to run locally at `http://localhost:5000`.

## Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

### Backend

```bash
npm run dev:backend
npm run start:backend
```

You can also run backend scripts directly inside `backend/` with `npm run dev` and `npm start`.

## Notes

- The frontend API client points to `http://localhost:5000/api`.
- Some package names in the repo still use older `skillswap` naming, but the product UI is branded as SkillFlow.
# NOTICE: The Community page is temporarily disabled.

