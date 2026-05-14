# Cloud Kitchen Simulator — Backend

## Overview

This is the backend for the Cloud Kitchen Simulator: an Express + Node.js API with MongoDB (Mongoose) and Socket.IO for real-time simulator updates. It exposes REST endpoints for rooms, servers, tasks, and scheduler operations and emits socket events to keep the frontend in sync.

## Prerequisites

- Node.js 18+ (or compatible LTS) installed
- MongoDB instance (local or hosted)

## Environment Variables

- `MONGO_URI` — MongoDB connection string
- `PORT` — HTTP server port (optional)
- Any other env values used by your local workflow (check `backend/package.json` scripts)

## Install

Run from the `backend/` folder:

```bash
npm install
```

## Run (development)

Common options — pick what matches your setup:

```bash
# Run using package script (if present)
npm run dev

# Or directly
node index.js
```

## API (high level)

- `GET /api/rooms` — list rooms
- `GET /api/rooms/:id` — get room details
- `POST /api/servers` — create server / auto-scale endpoints under `/api/servers`
- `POST /api/tasks` — create tasks; other task actions under `/api/tasks`
- `GET /api/tasks/logs` — list task logs
- `DELETE /api/tasks/logs` — clear task logs

Refer to the `backend/routes/` folder for the full route list.

## WebSocket Events (Socket.IO)

The backend emits and listens for events used by the frontend simulator. Notable events used by the app:

- `init` — initial room state
- `task:created`, `task:updated`, `task:removed` — task lifecycle
- `server:created`, `server:updated`, `server:removed` — server lifecycle
- `seed:progress` — seeding progress while batching many insertions
- `logs:created` / `logs:reset` — task log lifecycle

Event payloads generally include resource objects (task/server) and occasionally summary fields such as `{ deletedCount }` for bulk removals. See `backend/controllers/*` for precise shapes.

Key files to inspect:

- [backend/controllers/schedulerController.js](backend/controllers/schedulerController.js)
- [backend/controllers/taskController.js](backend/controllers/taskController.js)
- [backend/controllers/serverController.js](backend/controllers/serverController.js)
- [backend/index.js](backend/index.js)

## Fixes applied in this branch / session

- Detach tasks assigned to servers before deleting/resetting servers to avoid dangling references.
- Standardized bulk-delete payload to include `deletedCount` (frontend aligned to this field).
- Added dedupe guard for automatic task completion to avoid double-completion race conditions.
- Improved seeding endpoints to emit `seed:progress` for frontend progress UI.
- Added task log endpoints (`GET /api/tasks/logs`, `DELETE /api/tasks/logs`).

## Known Remaining Issues

- When servers are reset/seeded some tasks that were `running` may have their `assignedServer` cleared but remain `running` (i.e., stranded). Recommended fix: when detaching in reset/seed, also set `status` to `waiting`, clear `startedAt`, cancel scheduled completions, emit updates, and re-run scheduler logic. This change is not yet applied.

## Testing / Smoke checks

There are a few scripts in `backend/scripts/` (e.g., `smoke.js`, `seed.js`, `e2e-smoke.js`) that help exercise the API. Run them after starting the server and ensuring `MONGO_URI` is set.

## Troubleshooting

- If socket connections time out, check frontend env `VITE_API_URL` / socket URL and that CORS/socket origins match. The connection timeout was increased in recent fixes to be more tolerant.
- Check MongoDB connection string and that the DB is reachable from your environment.

## Next steps (recommended)

1. Apply the short fix to convert detached `running` tasks back to a schedulable state (see Known Remaining Issues).
2. Run end-to-end smoke tests with `backend/scripts/e2e-smoke.js` to validate scheduler & socket behavior.

If you want, I can open a PR with these README additions and also implement the remaining fix. 
# Cloud Kitchen Simulator — Backend

Backend for the cloud/restaurant resource allocation simulator.

**Features:**
- Real-time multi-user support with Socket.IO
- Per-room simulations (isolated state, independent experiments)
- Priority scheduling + least-loaded allocation
- Banker's algorithm safety checks

Prerequisites
- Node.js 18+ (or use `--experimental-fetch` for smoke script)
- MongoDB instance and a `MONGO_URI` environment variable

Run locally
1. Create a `.env` file in `backend/` with `MONGO_URI` (and optional `PORT`):

```
MONGO_URI=mongodb://localhost:27017/cloud-sim
PORT=5000
```

2. Install dependencies and start:

```bash
cd backend
npm install
npm run dev
```

Seeding sample servers

```bash
npm run seed
```

Smoke test (requires API running):

```bash
npm run smoke
```

API Endpoints
- `GET /health` — health check

### Room Management
- `POST /api/rooms` — create a new room (body: `name`)
- `GET /api/rooms` — list all rooms
- `GET /api/rooms/:roomId` — get room details

### Tasks, Servers, Scheduling
All endpoints below require `roomId` in query or body.

- `POST /api/servers/seed?roomId=xxx` — seed sample servers
- `POST /api/servers?roomId=xxx` — create server
- `GET /api/servers?roomId=xxx` — list servers
- `POST /api/tasks?roomId=xxx` — create task
- `GET /api/tasks?roomId=xxx` — list tasks
- `POST /api/tasks/:id/complete?roomId=xxx` — mark running task completed
- `POST /api/schedule/trigger?roomId=xxx` — run scheduler to allocate waiting tasks

Example: create a task (curl)

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"name":"T1","cpu":2,"ram":4,"priority":1,"executionTime":30}'
```

Notes & Next Steps
- **Per-room simulations**: Each room has isolated state. See [docs/room_based_simulations.md](../docs/room_based_simulations.md) for usage.
- The scheduler performs priority sorting and least-loaded allocation; Banker's safety check is implemented. 
- Tests: a simple `scripts/smoke.js` is provided. For full automated tests, add `jest` + `mongodb-memory-server` and unit tests for controllers.
