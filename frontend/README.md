# Cloud Kitchen Simulator — Frontend

## Overview

This is the React frontend for the Cloud Kitchen Simulator. Built with Vite + React, it consumes the backend REST API and real-time socket events to render the simulator UI (rooms, servers, tasks, scheduler visualization).

## Prerequisites

- Node.js 18+ (or compatible LTS)
- A running backend API reachable from the frontend (see Environment Variables)

## Environment Variables

- `VITE_API_URL` — base URL for backend HTTP API (e.g. `http://localhost:4000`)
- `VITE_SOCKET_URL` — optional explicit socket URL (if different from API)

## Install

Run from the `frontend/` folder:

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Key Concepts

- Contexts: `RoomContext`, `SimulatorContext`, `ViewModeContext` handle global simulator state and socket integration.
- Socket handling: the frontend listens to backend socket events and batches updates for UI performance. A polling fallback is available for resilience.
- Components: simulator views, server grid, task queue, and seed/auto-scale dialogs live under `src/components/simulator`.

Key files to inspect:

- [frontend/src/context/SimulatorContext.jsx](frontend/src/context/SimulatorContext.jsx)
- [frontend/src/context/RoomContext.jsx](frontend/src/context/RoomContext.jsx)
- [frontend/src/api/socket.js](frontend/src/api/socket.js)

## Recent Fixes

- Increased socket connection timeout to improve reliability under high load/slow networks.
- Fixed response-shape mismatch for auto-scale cleanup (now uses `deletedCount`).
- Rewrote broken `AutoScalingControlsMenu.jsx` and improved error handling in seeding dialogs.
- Added validation to clear stale persisted room state on startup if the room no longer exists on the backend.

## Running against local backend

Ensure `VITE_API_URL` points to your running backend (for example `http://localhost:4000`) then start dev server:

```bash
cd frontend
VITE_API_URL=http://localhost:4000 npm run dev
```

## Troubleshooting

- If socket events are missing or delayed, verify the backend is running and that CORS/socket origins allow the frontend origin.
- If the UI shows stale room state on load, open DevTools and clear `localStorage` for this app or use the Rooms page to re-select a room.

## Next steps (recommended)

1. Run the frontend while connected to the updated backend and exercise seeding/reset flows to confirm no tasks become stranded.
2. If you want, I can add a small E2E Playwright test that runs a seed/reset and verifies tasks end up schedulable.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
