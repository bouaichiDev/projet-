---
name: project-architecture
description: Which folder is the real frontend/backend pair, and how they connect
metadata:
  type: project
---

The repo has 3 Spring-related folders; the **active stack** is:
- Frontend: `gestion-de-dépenses-frontend/` (React + Vite, port 3000). Calls `http://localhost:8090/api`.
- Backend: `gestion-de-dépenses-frontend/backend/` (`com.expensetracker`, Spring Boot 3.3, port 8090, context-path `/api`, MySQL `expensetracker` with `createDatabaseIfNotExist=true`). This is the backend the frontend is wired to.

Ignore for connection work: `gestion-depenses/` (separate `com.exemple.depenses` backend, only an Auth controller, French field names, incomplete) and `expense-tracker-backend/` (near-empty duplicate scaffold).

Backend wraps every response in `ApiResponse{success,message,data}`; login's `AuthResponse` is flat (`token,id,firstname,lastname,email`). Frontend `src/services/api.ts` has a response interceptor that unwraps the envelope, and `AuthService` maps the flat login into `{token,user}`. Frontend `getApiMode()` defaults to `"real"`; a Navbar toggle switches demo/real. See [[run-backend-and-frontend]].
