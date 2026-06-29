# TaskFlow - Frontend React Application

This is the frontend single page client application for TaskFlow, built using Vite, React 19, TypeScript 6, and Tailwind CSS v4.

---

## Table of Contents
1. Core Features
2. Tech Stack and Key Libraries
3. Folder Structure
4. Setup and Installation
5. Environment Variables
6. Development and Build Instructions
7. Routing and State Management

---

## Core Features
- <b>Interactive Dashboards</b>: Responsive layouts including SVG Donut charts and progress bars for tasks analytics.
- <b>Role-Aware Routing and Workspaces</b>: Dynamic access checks for standard users, admins, and the Super Admin.
- <b>Centralized Notification System</b>: Toast context notification feedback for user actions.
- <b>Account Deactivation Appeal Forms</b>: Locked users are presented with a deactivation appeal submission workspace.
- <b>Accessibility (a11y)</b>: Keyboard focus indicators, trapped modal dialogs, and ARIA compliant structures.
- <b>Theme Settings</b>: Seamless toggling between light and dark modes.

---

## Tech Stack and Key Libraries
- <b>Builder</b>: Vite 6
- <b>Core Framework</b>: React 19 + TypeScript 6
- <b>State Management</b>: React Query v5 (@tanstack/react-query)
- <b>Forms and Validation</b>: react-hook-form + zod
- <b>Styling</b>: Tailwind CSS v4
- <b>Icons</b>: lucide-react

---

## Folder Structure
```text
frontend/
├── src/
│   ├── api/          # Axios API communication clients
│   ├── components/   # Reusable UI controls, tasks layouts, form elements
│   ├── context/      # Context managers (Auth status, Notification toast)
│   ├── features/     # Query hook definitions mapped by resources
│   ├── pages/        # Route page views (Login, Users list, Tasks lists)
│   ├── routes/       # Path definition files and route protection
│   ├── types/        # TypeScript type interfaces
│   ├── App.tsx       # Root React component
│   └── main.tsx      # Entry bootstrap file
├── netlify.toml      # Netlify hosting configurations
├── package.json      # Dependencies and scripts definitions
└── tsconfig.json     # Compiler configuration rules
```

---

## Setup and Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables:
   Copy .env.example to .env:
   ```bash
   copy .env.example .env
   ```

---

## Environment Variables

The application relies on a single configuration variable:

- <b>VITE_API_URL</b>: The full destination URL of the deployed TaskFlow backend service (default: http://localhost:5000/api).

---

## Development and Build Instructions

### Start Development Server
```bash
npm run dev
```
- The Vite server will launch and display the URL (default: http://localhost:5173).

### Production Build
Compile and bundle static assets for hosting:
```bash
npm run build
```
The compiled output is written to the `/dist` directory.

### Preview Production Build
```bash
npm run preview
```

---

## Routing and State Management

### 1. Client Routing (React Router v7)
- Path definitions are located in `src/routes/index.tsx`.
- <b>Public Routes</b>: Login, Register, Request-Reactivation.
- <b>Protected Routes</b>: Dashboard, Tasks workspace.
- <b>Admin Guards</b>: Users list (only accessible by users with role admin).

### 2. State & Cache Management (React Query)
- All server queries are cached and automatically refetched using `@tanstack/react-query`.
- Queries are organized inside the `src/features/` folder.
- Mutations automatically invalidate active query keys (e.g., creating a task invalidates `['tasks']` to trigger automatic background updates).
