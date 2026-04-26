# Testing Instruction Report — Urban Community

This document covers **Issue Reporting**, **Event management**, **Recycling** (centers + pickup requests), **User & organization management** (civilian + organization registration, shared login), and **performance** checks. The API entry remains `server/index.js`, with the Express app in `server/app.js` for Supertest. You can run **Issue**, **Event**, **Recycling**, and **User / organization** tests with **separate commands** on both backend and frontend.

---

## iv. Testing environment configuration

### Backend (Jest + Supertest + MongoDB Memory Server)

| Variable / file | Purpose |
|-----------------|--------|
| `server/.env` | Production-style `JWT_SECRET`, `MONGO_URI`, Cloudinary keys, etc. Used when you run `npm start` or `npm run dev`. |
| `server/tests/setup/jest.env.js` | Sets safe defaults for `JWT_SECRET` and a placeholder `MONGO_URI` **before** tests load. Integration suites call `mongoose.connect()` to **MongoDB Memory Server**. |
| `jest.config.cjs` | Jest `rootDir` is `server/`; tests live under `server/tests/`. |

**Note:** Joi’s `email()` validator rejects some synthetic TLDs (for example `.local`, `.test`). Integration tests use addresses under **`example.com`** so validation matches production rules.

**Requirements:** Node.js LTS, npm, and disk space for the first `mongodb-memory-server` binary download (cached afterward).

### Frontend (Vitest + jsdom + React Testing Library)

| Item | Purpose |
|------|--------|
| `frontend/vitest.config.js` | Merges with `vite.config.js` (`@` → `src`), `jsdom` environment. |
| `frontend/src/test/setup.js` | Registers `@testing-library/jest-dom` matchers. |

Some modules use a default **`import React from "react"`** so JSX runs consistently under Vitest.

### Performance (Artillery)

| Script | Scenario |
|--------|----------|
| `npm run issues` (in `performance/`) | `GET /api/issues/me` — optional `PERF_ISSUES_JWT` (see `processor.js`). |
| `npm run events` (in `performance/`) | `GET /api/events` — optional `PERF_EVENTS_JWT` (see `events-processor.js`). |
| `npm run recycling` (in `performance/`) | `GET /api/recycling/centers` with sample query params (`recycling.yml`). |
| `npm run user-org` (in `performance/`) | `POST /api/civilian/register` then `POST /api/users/login` with unique `example.com` emails (`user-org-processor.js`). |

Install once: `cd performance && npm install`. Run the API with real `MONGO_URI` and `JWT_SECRET` before load tests.

---

## Running suites separately

### Backend (`server/`)

| Command | Scope |
|---------|--------|
| `npm test` | All Jest tests (issues + events + recycling + user/org + all unit files). |
| `npm run test:issues` | `issues.integration.test.js` + `issue.validation.test.js` only. |
| `npm run test:events` | `events.integration.test.js` + `events.validation.test.js` only. |
| `npm run test:recycling` | `recycling.integration.test.js` + `recycling.validation.test.js` only. |
| `npm run test:user-org` | `citizenOrganization.integration.test.js` + `citizen.validation.test.js` + `organization.validation.test.js` + `user.validation.test.js` only. |
| `npm run test:unit` | Every file under `tests/unit/`. |
| `npm run test:integration` | Every file under `tests/integration/`. |

### Frontend (`frontend/`)

| Command | Scope |
|---------|--------|
| `npm test` | Full Vitest run (all `*.test.js` / `*.test.jsx` discovered by Vitest). |
| `npm run test:issues` | `issue.service.test.js` + `IssueReportingPage.test.jsx`. |
| `npm run test:events` | `civilian.events.service.test.js` + `CivilianEvents.test.jsx`. |
| `npm run test:recycling` | `recycling.service.test.js` + `RecyclingCentersPage` + `GarbagePickupRequestPage` tests. |
| `npm run test:user-org` | `civilian.service`, `organization.service`, `auth.service`, `RegisterCivilian`, `RegisterOrganization`, `LoginPage` tests. |

### Performance (`performance/`)

| Command | Scope |
|---------|--------|
| `npm run issues` | Issue list API load (`issue-reporting.yml`). |
| `npm run events` | Community events list (`events.yml`). |
| `npm run recycling` | Recycling centers search (`recycling.yml`). |
| `npm run user-org` | Registration + login flow (`user-organization.yml`). |

---

## i. How to run unit tests

### Backend

```bash
cd server
npm install
npm run test:unit
```

Notable files:

- `tests/unit/issue.validation.test.js` — Issue Joi schemas.
- `tests/unit/citizen.validation.test.js` — Civilian register / profile schemas.
- `tests/unit/organization.validation.test.js` — Organization register / update schemas.
- `tests/unit/user.validation.test.js` — Shared login schema.
- `tests/unit/events.validation.test.js` — Event create / update Joi schemas.
- `tests/unit/recycling.validation.test.js` — Recycling center + pickup Joi schemas.

### Frontend

```bash
cd frontend
npm install
npm test
```

Or only one product area:

```bash
npm run test:issues
npm run test:events
npm run test:recycling
npm run test:user-org
```

---

## ii. Integration testing — setup and execution

### Issue Reporting (`tests/integration/issues.integration.test.js`)

- `POST /api/issues/create`, `GET /api/issues/me`, `GET/DELETE /api/issues/:id`, admin status, analytics, admin-response, admin list filters & pagination.
- **Upload:** Jest manual mock `server/middlewares/__mocks__/upload.middleware.js` (in-memory multer).

### User & organization management (`tests/integration/citizenOrganization.integration.test.js`)

- `POST /api/civilian/register` (201, 409 duplicate, 400 validation).
- `POST /api/organization/register` (201, 409 duplicate).
- `POST /api/users/login` (civilian + organization success paths, wrong password, unknown email).
- `GET` / `PUT` `/api/civilian/me` and `/api/organization/me` with JWT.

### Event management (`tests/integration/events.integration.test.js`)

- `POST /api/events` — auth, validation, create with `orgId` from JWT.
- `GET /api/events` — optional auth; membership status when a `Member` record exists.
- `GET /api/events/:id` — public detail, 404 when missing.
- `GET /api/events/my-events` — organization-scoped list.
- `PUT` / `DELETE /api/events/:id` — update and remove (assert with `countDocuments`).

### Recycling (`tests/integration/recycling.integration.test.js`)

- `GET /api/recycling/centers` — list, optional `city` / `wasteType` / `search` filters.
- `GET /api/recycling/centers/:id` — detail, 404 when missing.
- `POST` / `PUT` / `DELETE /api/recycling/centers` — admin-only create, partial update, delete (assert removal with `countDocuments`).
- `POST /api/recycling/request-pickup` — civilian JWT, validation, 201 create.
- `GET /api/recycling/pickups/my` — authenticated citizen list.
- `GET /api/recycling/pickups` — admin list.
- `PUT /api/recycling/pickups/:id/status` — admin status updates (validation + 404).

### Commands

```bash
cd server
npm install
npm run test:integration   # all integration files
npm run test:issues        # issues only
npm run test:events        # events only
npm run test:recycling     # recycling only
npm run test:user-org      # user/org only
npm test                   # everything
```

---

## iii. Performance testing — setup and execution

```bash
cd performance
npm install
```

**Issue module**

```powershell
$env:PERF_ISSUES_JWT = "<optional civilian JWT>"
npm run issues
```

**Events**

```powershell
$env:PERF_EVENTS_JWT = "<optional civilian JWT>"
npm run events
```

**Recycling**

```bash
npm run recycling
```

**User / organization**

```bash
npm run user-org
```

Override base URL:

```bash
npx artillery run issue-reporting.yml --target http://127.0.0.1:3000
npx artillery run events.yml --target http://127.0.0.1:3000
npx artillery run recycling.yml --target http://127.0.0.1:3000
npx artillery run user-organization.yml --target http://127.0.0.1:3000
```

---

## Quick reference — npm scripts

| Location | Command | Description |
|----------|---------|-------------|
| `server/` | `npm test` | All Jest tests |
| `server/` | `npm run test:issues` | Issue module Jest subset |
| `server/` | `npm run test:events` | Event module Jest subset |
| `server/` | `npm run test:recycling` | Recycling module Jest subset |
| `server/` | `npm run test:user-org` | User/org management Jest subset |
| `server/` | `npm run test:unit` | All unit tests |
| `server/` | `npm run test:integration` | All integration tests |
| `frontend/` | `npm test` | All Vitest tests |
| `frontend/` | `npm run test:issues` | Issue UI + service subset |
| `frontend/` | `npm run test:events` | Events service + `CivilianEvents` subset |
| `frontend/` | `npm run test:recycling` | Recycling service + civilian pages subset |
| `frontend/` | `npm run test:user-org` | Registration/login UI + services subset |
| `performance/` | `npm run issues` | Artillery — issue list |
| `performance/` | `npm run events` | Artillery — events list |
| `performance/` | `npm run recycling` | Artillery — recycling centers |
| `performance/` | `npm run user-org` | Artillery — register + login |

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
