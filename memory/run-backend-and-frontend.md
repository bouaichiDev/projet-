---
name: run-backend-and-frontend
description: How to build/run the backend (JDK 21 + jar workaround) and the frontend
metadata:
  type: reference
---

**Backend** (`gestion-de-dépenses-frontend/backend/`) targets **Java 21** — `JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.5.11-hotspot`. There is no `mvnw`; use IntelliJ's bundled Maven: `C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd`.

Do NOT use `mvn spring-boot:run` — the `é` in the folder path corrupts the plugin's forked-JVM classpath argfile under Cp1252 (`ClassNotFoundException` on the main class). Instead build a jar and run it (jar's internal classpath is relative, so the path is safe):
```
mvn -f <backend>/pom.xml package -DskipTests
java -Dfile.encoding=UTF-8 -jar <backend>/target/expense-tracker-backend-1.0.0.jar
```
MySQL must be running on localhost:3306 (root / empty password) — it auto-creates the `expensetracker` DB and tables on boot.

**Frontend**: `cd gestion-de-dépenses-frontend && npm install && npm run dev` → http://localhost:3000. `npm run lint` = `tsc --noEmit`. See [[project-architecture]].

Dashboard/stats: the backend `/dashboard` endpoints return a different DTO shape than the frontend expects, so `DashboardService.ts` now IGNORES them and derives `DashboardStats`/`StatsOverview` client-side from `ExpenseService.getAll()` + `BudgetService.get()` (+ `CategoryService.getAll()`), in both demo and real modes. Also `BudgetService.get()` normalizes the backend `BudgetStatusResponse` ({budgetAmount,...}) into the `Budget` shape ({amount,month,year}). New real-mode accounts start empty (no seeded categories/expenses).
