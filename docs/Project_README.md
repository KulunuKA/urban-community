# Urban Community — Project README

**Classification:** Public-SLIIT  

This document explains how to run the **Urban Community** stack and how its **HTTP API** is organized. The application is split into two runnable parts:

| Part | Folder | Role |
|------|--------|------|
| **Backend** | `server/` | Express REST API, MongoDB, JWT auth, file uploads (Cloudinary). |
| **Frontend** | `frontend/` | Vite + React SPA (browser UI). |

Install dependencies, configure environment variables, and start **each** part **separately** (typically two terminals). The backend and frontend each have their own `package.json` and `node_modules`.

> **Note:** Some branches may also contain a small Express app at the **repository root** (`index.js`). The **primary** product API and the instructions below refer to the **`server/`** backend used with **`frontend/`**.

---

## Table of contents

1. [Setup instructions](#i-setup-instructions-step-by-step)
2. [API endpoint documentation](#ii-api-endpoint-documentation)
3. [Local URLs and dev proxy](#local-urls-and-dev-proxy)
4. [Troubleshooting](#troubleshooting)

---

## i. Setup instructions (step-by-step)

### Prerequisites

- **Node.js** (LTS recommended) and **npm**
- **MongoDB** reachable via a connection string (local install or **Atlas**)
- **Cloudinary** account (for issue images and related upload features)
- Two terminal windows (or tabs) for backend + frontend

### A. Backend (`server/`)

1. **Go to the server folder**

   ```bash
   cd server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `server/.env`**

   The server loads **`server/.env`** via `dotenv` (see `server/index.js`). At minimum you need:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `JWT_SECRET` | **Yes** | Secret for signing and verifying JWTs. The server exits on startup if this is missing or empty. |
   | `MONGO_URI` | **Yes** | MongoDB connection string (e.g. `mongodb://127.0.0.1:27017/urban-community`). |
   | `PORT` | No | HTTP port for the API. Defaults to **3000**. |
   | `CLOUDINARY_CLOUD_NAME` | Yes for uploads | Used by `server/config/cloudinary.js` for issue images. |
   | `CLOUDINARY_API_KEY` | Yes for uploads | Cloudinary API key. |
   | `CLOUDINARY_API_SECRET` | Yes for uploads | Cloudinary API secret. |
   | `NODE_ENV` | No | e.g. `development` / `production` (affects error detail in responses). |

   **Example `server/.env` (adjust values):**

   ```env
   JWT_SECRET=your-long-random-secret-change-me
   MONGO_URI=mongodb://127.0.0.1:27017/urban-community
   PORT=3000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NODE_ENV=development
   ```

4. **Start MongoDB** so `MONGO_URI` is valid.

5. **Run the API**

   ```bash
   npm run dev
   ```

   Or without auto-restart:

   ```bash
   npm start
   ```

   On success you should see **`MongoDB Connected!`** and **`Server running on port …`** (default **3000**).

### B. Frontend (`frontend/`)

1. **Open a second terminal** and go to the frontend folder:

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment variables (optional in dev)**

   On the **`main`** branch, `frontend/vite.config.js` proxies **`/api`** to **`http://localhost:3000`**. So during **`npm run dev`**, the browser can call **`/api/...`** on the Vite dev server and traffic is forwarded to the backend **without** extra env vars.

   For **production builds** or if you change ports, you may add a **`frontend/.env`** (or `.env.local`) with whatever variables your branch’s code reads (often **`VITE_...`** for Vite). Align values with your backend URL and team conventions.

4. **Run the web app**

   ```bash
   npm run dev
   ```

   Vite prints a local URL (commonly **`http://localhost:5173`**). Open it in the browser.

### C. Run both together

1. Terminal 1: `cd server` → configure **`server/.env`** → `npm run dev`
2. Terminal 2: `cd frontend` → `npm run dev`
3. Use the Vite URL in the browser; API calls go to **`/api`** and are proxied to the backend (see below).

### D. Optional: other folders

- **`performance/`** — Artillery load tests (separate `npm install`; see `docs/TESTING_INSTRUCTIONS.md` if present).
- **Repository root `index.js`** — If present, it is a separate minimal server; do not confuse it with **`server/index.js`**.

---

## Local URLs and dev proxy

| Service | Typical URL | Notes |
|---------|-------------|--------|
| Backend API | `http://localhost:3000` | Set `PORT` in `server/.env` to change. |
| Frontend (Vite) | `http://localhost:5173` | Port shown in terminal when you run `npm run dev`. |
| API via Vite | Same origin as Vite + path `/api/...` | Proxied to `http://localhost:3000` per `vite.config.js`. |

---

## ii. API endpoint documentation

This section describes the REST API served from **`server/`**, using route modules mounted in **`server/index.js`**. Paths are relative to the **API host** (e.g. `http://localhost:3000`). If your fork differs, treat **`server/**/*.js`** route files as the source of truth.

### Conventions

- **JSON:** Unless noted, send **`Content-Type: application/json`** and a JSON body.
- **Responses:** Many handlers use `{ success: true | false, ... }`. Validation errors often return **`400`** with `{ success: false, errors: string[] }`.
- **IDs:** MongoDB **`ObjectId`** strings (24 hex characters) appear in URLs and bodies.

### Authentication

| Mechanism | Header | Used for |
|-----------|--------|----------|
| **User JWT** | `Authorization: Bearer <token>` | Civilian, organization, and general **user** routes (`userAuth` middleware). Token is issued by **`POST /api/users/login`**. |
| **Admin JWT** | `Authorization: Bearer <admin-token>` | Routes protected by **`AdminAuth`**. Token payload must include **`role: "admin"`** (see `server/middlewares/AdminAuth.js`). Obtain admin tokens via the **admin** login route(s) under **`server/modules/admin/`** (exact path in your branch — open that module in the repo). |

Missing or invalid Bearer tokens typically return **`401`** with `{ success: false, message: "Unauthorized" }` or **`Invalid or expired token`**. Wrong role for admin routes returns **`403`**.

---

### Summary — all route prefixes

| Prefix | Module (in `server/`) |
|--------|----------------------|
| `/api/civilian` | Citizen registration + profile |
| `/api/organization` | Organization registration + profile |
| `/api/users` | Shared login |
| `/api/events` | Community events |
| `/api/issues` | Issue reporting + admin issue tools |
| `/api/recycling` | Centers + pickup requests |
| `/api/member` | Event membership requests |
| `/api/notifications` | In-app notifications |
| `/api/admin` | Admin-only routes (see `modules/admin` in your clone) |

---

### `/api/civilian` — Civilian

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/civilian/register` | None | Register civilian (`name`, `email`, `password`). |
| `GET` | `/api/civilian/me` | User JWT | Current profile. |
| `PUT` | `/api/civilian/me` | User JWT | Update profile (partial fields allowed by Joi). |

**`POST /register` body (JSON):**

| Field | Rules |
|-------|--------|
| `name` | string, required, trimmed, **2–100** chars |
| `email` | valid email, required, trimmed, lowercased |
| `password` | string, required, **min 6** chars |

**`PUT /me` body (JSON, partial):** optional `name`, `phone`, `profileImage` (URI), `bio`, `location` `{ city, district, province }`, `preferredLanguage` — see `server/modules/citizen/citizen.validation.js`.

**Example — register**

```http
POST /api/civilian/register HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "name": "Nimal Perera",
  "email": "nimal@example.com",
  "password": "secret12"
}
```

**Example — success (typical `201`)**

```json
{
  "success": true,
  "message": "Civilian registered successfully",
  "data": { "_id": "…", "name": "Nimal Perera", "email": "nimal@example.com" }
}
```

---

### `/api/organization` — Organization

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/organization/register` | None | Register organization. |
| `GET` | `/api/organization/me` | User JWT | Current profile. |
| `PUT` | `/api/organization/me` | User JWT | Update profile (at least one field). |

**`POST /register` body (JSON):** `name`, `description`, `address`, `phone`, `email`, `password` — see `organization.validation.js` (name/description/address min length 2; phone min 6; password min 6).

---

### `/api/users` — Shared login

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/users/login` | None | Login as **civilian** or **organization** by email/password. |

**Request body (JSON):**

| Field | Rules |
|-------|--------|
| `email` | required, valid email |
| `password` | required, min 6 chars |

**Example**

```http
POST /api/users/login HTTP/1.1
Content-Type: application/json

{
  "email": "nimal@example.com",
  "password": "secret12"
}
```

**Example — success (`200`)**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "_id": "…",
      "name": "Nimal Perera",
      "email": "nimal@example.com",
      "role": "citizen"
    }
  }
}
```

**Notes:** Passwords are checked with **bcrypt**. Wrong password → **`401`** `Invalid password`. Unknown email → **`401`** `Invalid email or password`. Organizations receive **`role: "organization"`** in the returned user object.

---

### `/api/events` — Events

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/events/my-events` | User JWT | Events for the authenticated organization. |
| `GET` | `/api/events` | User JWT | List events (implementation in controller). |
| `GET` | `/api/events/:id` | None (route file) | Event by ID. |
| `POST` | `/api/events` | User JWT | Create event (validated body). |
| `PUT` | `/api/events/:id` | User JWT | Update event (partial allowed, **min 1** field). |
| `DELETE` | `/api/events/:id` | User JWT | Delete event. |

**`POST /` JSON body (validated):** `title` (5–100), `description` (min 10), `date` (must be **after now**), `location`, `organization` — see `events.validation.js`.

---

### `/api/issues` — Issues

`POST /create` uses **multipart/form-data** (field **`image`** + text fields), not raw JSON.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/issues/create` | User JWT | Create issue (**multipart**: `image` file + fields). |
| `GET` | `/api/issues` | Admin JWT | All issues (admin). |
| `GET` | `/api/issues/analytics/summary` | Admin JWT | Analytics summary. |
| `GET` | `/api/issues/me` | User JWT | Current user’s issues. |
| `GET` | `/api/issues/admin/:id` | Admin JWT | Issue detail for admin. |
| `GET` | `/api/issues/:id` | User JWT | Issue by ID. |
| `GET` | `/api/issues/user/:userId` | User JWT | Issues by user. |
| `PATCH` | `/api/issues/:id/status` | Admin JWT | Update status. |
| `PATCH` | `/api/issues/:id/admin-response` | Admin JWT | Add admin response. |
| `DELETE` | `/api/issues/:id` | User JWT | Delete issue. |

**Multipart fields (validated with text parts):** `title` (3–100), `description` (10–1000), `category` (one of: **infrastructure, waste, water, electricity, environment, safety, other** — stored lowercase in validation), `location` (min 3). File: **`image`** (jpg/jpeg/png/webp per storage config).

**`PATCH .../status` JSON:** `{ "status": "Pending" | "InProgress" | "Resolved" | "Rejected" }`

**`PATCH .../admin-response` JSON:** `{ "adminResponse": "…" }` (1–2000 chars)

**Example — create issue (curl)**

```bash
curl -X POST "http://localhost:3000/api/issues/create" ^
  -H "Authorization: Bearer YOUR_JWT" ^
  -F "title=Broken streetlight" ^
  -F "description=Light out near junction for several nights." ^
  -F "category=infrastructure" ^
  -F "location=Colombo 03, Galle Road" ^
  -F "image=@./photo.jpg"
```

---

### `/api/recycling` — Recycling centers & pickups

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/recycling/centers` | None | List/search centers (query params depend on controller). |
| `GET` | `/api/recycling/centers/:id` | None | Center by ID. |
| `POST` | `/api/recycling/centers` | Admin JWT | Create center. |
| `PUT` | `/api/recycling/centers/:id` | Admin JWT | Update center (partial). |
| `DELETE` | `/api/recycling/centers/:id` | Admin JWT | Delete center. |
| `POST` | `/api/recycling/request-pickup` | User JWT | Create pickup request. |
| `GET` | `/api/recycling/pickups/my` | User JWT | My pickup requests. |
| `GET` | `/api/recycling/pickups` | Admin JWT | All pickup requests. |
| `PUT` | `/api/recycling/pickups/:id/status` | Admin JWT | Update pickup status. |

**Create center JSON:** `name`, `address`, `city`, `wasteTypes` (array of **plastic, glass, paper, metal, ewaste, organic**), `latitude`, `longitude`, optional `contactNumber`, `openHours` — see `recycling.validation.js`.

**Create pickup JSON:** `wasteType` (one of allowed), `quantityKg` (> 0), `pickupDate` (not in past), `address`, `city`, optional `notes`.

**Update pickup status JSON:** `{ "status": "Pending" | "Accepted" | "Collected" | "Rejected" }`

---

### `/api/member` — Event membership

All routes use **User JWT**.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/member/send-request` | Send membership request. |
| `GET` | `/api/member/requests` | My requests. |
| `GET` | `/api/member/get-requests/:eventId` | Requests for an event. |
| `PUT` | `/api/member/response-request/:requestId` | Body: `{ "status": "Accepted" \| "Rejected" }`. |
| `GET` | `/api/member/get-members/:eventId` | Members for an event. |
| `DELETE` | `/api/member/delete-member` | JSON body: `memberId`, `eventId` (24-hex strings). |

---

### `/api/notifications` — Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/notifications` | User JWT | List notifications. |
| `PATCH` | `/api/notifications/:id/read` | User JWT | Mark one as read. |

---

### `/api/admin` — Admin routes

`server/index.js` mounts **`adminRoute`** at **`/api/admin`**. The exact login and management paths live in **`server/modules/admin/`** in your branch (filename may differ). Open that folder after cloning to document or call **admin login** and obtain an **admin JWT** for **`AdminAuth`** routes (issues admin list, recycling admin actions, etc.).

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Backend exits immediately | **`JWT_SECRET`** set and non-empty in **`server/.env`**. |
| MongoDB errors | **`MONGO_URI`** correct; MongoDB running; Atlas IP allowlist. |
| `401 Unauthorized` on protected routes | `Authorization: Bearer <token>` header present; token from **`/api/users/login`** or admin login; not expired. |
| `403` on admin routes | Token must be an **admin** JWT (`role: "admin"`). |
| Image upload failures | **Cloudinary** env vars in **`server/.env`**; file type allowed (jpg/png/webp, etc.). |
| Frontend cannot reach API | Backend running on **3000**; Vite **proxy** in `vite.config.js` matches your backend port; or set explicit API base URL for production. |
| CORS in production | Configure **`cors()`** / allowed origins on the server for your deployed frontend URL. |

---

## API reference source

Endpoint lists and bodies in this README are aligned with the **KulunuKA/urban-community** **`server/index.js`** and route modules on the public **`main`** branch. Your local branch may add or rename routes—verify with:

```text
server/index.js
server/modules/**/**Route*.js
server/modules/**/*.route.js
```

---

*Classification: **Public-SLIIT**.*
