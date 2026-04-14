# Testing Instruction Report — Urban Community

This document is the **Testing Instruction Report** for the Urban Community project. It explains how automated tests are organized, how to run them, and what environment each layer expects.

The backend API entry is `server/index.js`, with the Express application mounted in `server/app.js` (used by **Supertest** in integration tests). You can run **Issue reporting**, **Event management**, **Recycling** (centers + pickup requests), **User and organization management** (civilian + organization registration, shared login), and **performance** (Artillery) checks using the commands below.

---

## Testing Instruction Report

### i. How to run unit tests

**Unit tests** here means tests that do **not** require a running API server or a real MongoDB instance for the backend (Joi validation and similar logic), and **Vitest** component or service tests on the frontend that run in **jsdom** without a browser.

#### Backend (Jest) — `server/tests/unit/`

1. Open a terminal and install dependencies:

   ```bash
   cd server
   npm install
   ```

2. Run **all** backend unit tests (everything under `tests/unit/`):

   ```bash
   npm run test:unit
   ```

   This uses `jest.config.cjs` with `--runInBand` so tests run serially (stable with MongoDB Memory Server when integration suites are mixed in other scripts; unit-only runs are fast).

3. **What is covered** (representative files):

   - `tests/unit/issue.validation.test.js` — Issue Joi schemas.
   - `tests/unit/citizen.validation.test.js` — Civilian register / profile schemas.
   - `tests/unit/organization.validation.test.js` — Organization register / update schemas.
   - `tests/unit/user.validation.test.js` — Shared login schema.
   - `tests/unit/events.validation.test.js` — Event create / update Joi schemas.
   - `tests/unit/recycling.validation.test.js` — Recycling center + pickup Joi schemas.

#### Frontend (Vitest) — `frontend/src/**/__tests__/**`

The frontend does **not** use a separate `test:unit` script. Service and page tests are all run with Vitest.

1. Install and run the full suite once (CI-style, non-watch):

   ```bash
   cd frontend
   npm install
   npm test
   ```

   `npm test` runs `vitest run`, which discovers `*.test.js` and `*.test.jsx` according to `frontend/vitest.config.js`.

2. Optional: **watch mode** while developing:

   ```bash
   npm run test:watch
   ```

3. Optional: run tests for **one product area** only (still Vitest; mixes service + UI tests for that module):

   ```bash
   npm run test:issues
   npm run test:events
   npm run test:recycling
   npm run test:user-org
   ```

---

### ii. Integration testing setup and execution

#### What integration tests do

Backend integration tests live under `server/tests/integration/`. They start an in-memory MongoDB (**MongoDB Memory Server**), connect **Mongoose**, mount the real Express app, and call HTTP routes with **Supertest**. They validate end-to-end behavior for the API (status codes, persistence, auth, and validation) without pointing at your production database.

#### Setup (one-time and per machine)

1. **Node.js** — Use a current **LTS** version of Node.js and **npm**.
2. **Dependencies** — From `server/`:

   ```bash
   cd server
   npm install
   ```

3. **First run note** — The first time tests use **mongodb-memory-server**, it may download a MongoDB binary. That can take several minutes and needs disk space; later runs use the cache.
4. **Jest environment** — `server/tests/setup/jest.env.js` is loaded before tests (via `jest.config.cjs` `setupFiles`). It sets safe defaults for `JWT_SECRET` and a placeholder `MONGO_URI`. Integration suites **override** this by connecting to the in-memory server, so you do **not** need a local `mongod` for these tests.
5. **File uploads** — Issue routes that use Multer / Cloudinary are exercised with an in-memory Jest manual mock: `server/middlewares/__mocks__/upload.middleware.js`, so integration tests do not call Cloudinary.

#### Execution

Run **all** integration files:

```bash
cd server
npm run test:integration
```

Run **everything** (unit + integration):

```bash
npm test
```

Run **one module** (integration file(s) for that module **plus** its validation unit tests):

```bash
npm run test:issues      # issues.integration + issue.validation
npm run test:events      # events.integration + events.validation
npm run test:recycling   # recycling.integration + recycling.validation
npm run test:user-org    # citizenOrganization.integration + citizen/org/user validation
```

#### Coverage by file (high level)

| File | Scope |
|------|--------|
| `issues.integration.test.js` | `POST /api/issues/create`, `GET /api/issues/me`, `GET/DELETE /api/issues/:id`, admin status, analytics, admin-response, admin list filters and pagination. |
| `citizenOrganization.integration.test.js` | Civilian and organization registration, duplicate and validation cases, shared login, JWT-protected `GET`/`PUT` profile routes. |
| `events.integration.test.js` | Create/list/detail/update/delete events, auth, validation, membership behavior where applicable. |
| `recycling.integration.test.js` | Centers list/detail/filters, admin CRUD on centers, pickup request, civilian and admin pickup lists, admin status updates. |

**Validation detail:** Joi’s `email()` rejects some synthetic TLDs (for example `.local`, `.test`). Tests use addresses under **`example.com`** so they match production-like rules.

---

### iii. Performance testing setup and execution

Performance tests live in the **`performance/`** package. They use **Artillery** to generate HTTP load against a **running** API (not against MongoDB Memory Server).

#### Setup

1. Start the **real** backend with valid configuration (at minimum **`MONGO_URI`** and **`JWT_SECRET`** in `server/.env`, plus any other keys your routes need). Example:

   ```bash
   cd server
   npm install
   npm run dev
   ```

   Default Artillery targets in the YAML files assume the API on **`http://localhost:3000`** unless you override `--target` (see below).

2. Install Artillery dependencies:

   ```bash
   cd performance
   npm install
   ```

#### Execution

From **`performance/`**:

| Command | Scenario file | What it stresses |
|---------|---------------|------------------|
| `npm run issues` | `issue-reporting.yml` | `GET /api/issues/me` — optional JWT via `PERF_ISSUES_JWT` (see `processor.js`). |
| `npm run events` | `events.yml` | `GET /api/events` — optional JWT via `PERF_EVENTS_JWT` (see `events-processor.js`). |
| `npm run recycling` | `recycling.yml` | `GET /api/recycling/centers` with sample query params. |
| `npm run user-org` | `user-organization.yml` | `POST /api/civilian/register` then `POST /api/users/login` with unique `example.com` emails (`user-org-processor.js`). |

**Windows (PowerShell)** — set optional JWTs for authenticated scenarios:

```powershell
$env:PERF_ISSUES_JWT = "<optional civilian JWT>"
npm run issues

$env:PERF_EVENTS_JWT = "<optional civilian JWT>"
npm run events
```

**macOS / Linux (bash)** — same idea:

```bash
export PERF_ISSUES_JWT="<optional civilian JWT>"
npm run issues

export PERF_EVENTS_JWT="<optional civilian JWT>"
npm run events
```

**Recycling** and **user-org** scripts typically need no extra env vars beyond a healthy API and database.

**Different host or port:**

```bash
npx artillery run issue-reporting.yml --target http://127.0.0.1:3000
npx artillery run events.yml --target http://127.0.0.1:3000
npx artillery run recycling.yml --target http://127.0.0.1:3000
npx artillery run user-organization.yml --target http://127.0.0.1:3000
```

Interpret Artillery’s summary output (latency percentiles, RPS, error rate) against your assignment or SLA targets.

---

### iv. Testing environment configuration details

#### Backend — Jest + Supertest + MongoDB Memory Server

| Variable / file | Role |
|-----------------|------|
| `server/.env` | Used when you run `npm start` or `npm run dev`: `JWT_SECRET`, `MONGO_URI`, Cloudinary keys, etc. **Not** required for Jest integration tests that use the memory server, but required for **manual** testing and for **Artillery** against a live server. |
| `server/tests/setup/jest.env.js` | Sets `JWT_SECRET` and `MONGO_URI` defaults **before** application code reads `process.env`. Integration tests connect to **MongoDB Memory Server** instead of the placeholder URI. |
| `server/jest.config.cjs` | `testEnvironment: "node"`; roots under `server/tests`; `testMatch: **/*.test.js`; `setupFiles` → `jest.env.js`; `testTimeout` 60000 ms; `forceExit: true`. |

**Requirements:** Node.js LTS, npm, and (first run) disk space and time for the **mongodb-memory-server** binary download.

#### Frontend — Vitest + jsdom + React Testing Library

| Item | Role |
|------|------|
| `frontend/vitest.config.js` | Merges with `vite.config.js` (including `@` → `src`), sets `environment: "jsdom"`, `setupFiles: ./src/test/setup.js`, `css: true`. |
| `frontend/src/test/setup.js` | Registers `@testing-library/jest-dom` matchers for assertions. |

Some test files use an explicit **`import React from "react"`** so JSX behaves consistently under Vitest.

#### Performance — Artillery

| Item | Role |
|------|------|
| `performance/package.json` scripts | `issues`, `events`, `recycling`, `user-org` → `artillery run` on the matching YAML. |
| Optional env vars | `PERF_ISSUES_JWT`, `PERF_EVENTS_JWT` for authenticated list endpoints where processors inject headers. |
| Live API | Artillery expects the **real** server and **real** `MONGO_URI`; load tests should not be aimed at production without approval. |

---

## Quick reference — npm scripts

| Location | Command | Description |
|----------|---------|-------------|
| `server/` | `npm test` | All Jest tests (unit + integration). |
| `server/` | `npm run test:unit` | All files under `tests/unit/`. |
| `server/` | `npm run test:integration` | All files under `tests/integration/`. |
| `server/` | `npm run test:issues` | Issue integration + issue validation unit. |
| `server/` | `npm run test:events` | Events integration + events validation unit. |
| `server/` | `npm run test:recycling` | Recycling integration + recycling validation unit. |
| `server/` | `npm run test:user-org` | User/org integration + related validation units. |
| `frontend/` | `npm test` | Full Vitest run (`vitest run`). |
| `frontend/` | `npm run test:watch` | Vitest watch mode. |
| `frontend/` | `npm run test:issues` | Issue service + `IssueReportingPage` tests. |
| `frontend/` | `npm run test:events` | Events service + `CivilianEvents` tests. |
| `frontend/` | `npm run test:recycling` | Recycling service + civilian recycling pages. |
| `frontend/` | `npm run test:user-org` | Registration/login services and pages. |
| `performance/` | `npm run issues` | Artillery — issue list scenario. |
| `performance/` | `npm run events` | Artillery — events list scenario. |
| `performance/` | `npm run recycling` | Artillery — recycling centers scenario. |
| `performance/` | `npm run user-org` | Artillery — register + login scenario. |

---

## Troubleshooting (Windows / npm)

- If `npm install` under `server/` fails with **`ENOTEMPTY`**, close processes locking `server/node_modules`, delete the folder, and reinstall.
- First **`mongodb-memory-server`** run may take several minutes.

## Extending tests later

- **Issues:** My reports filters, image type warnings, `createIssue` API errors.
- **Events:** Invalid ObjectId on `GET /:id`, member request edge cases, org-only routes.
- **Recycling:** Admin recycling UI (`AdminRecyclingCentersPage`), invalid center id edge cases.
- **User/org:** Admin user routes, password reset, stricter duplicate checks across collections.
- Keep **Cloudinary** out of Jest integration by retaining the upload middleware mock for issue routes.
