import { api, getApiMode, demoDb } from "./api";
import { Budget } from "../types";

// The GET /budget endpoint returns a BudgetStatusResponse ({ budgetAmount, ... })
// while the rest of the app works with the Budget shape ({ amount, month, year }).
// Normalize whatever the backend returns into a Budget the UI can rely on.
function normalizeBudget(raw: any): Budget {
  const now = new Date();
  if (!raw) {
    return { amount: 0, month: now.getMonth() + 1, year: now.getFullYear() };
  }
  return {
    id: raw.id,
    amount: Number(raw.amount ?? raw.budgetAmount ?? 0),
    month: raw.month ?? now.getMonth() + 1,
    year: raw.year ?? now.getFullYear(),
  };
}

export const BudgetService = {
  async get(): Promise<Budget> {
    const mode = getApiMode();
    if (mode === "demo") {
      return demoDb.getBudget();
    }
    try {
      const response = await api.get("/budget");
      const raw = Array.isArray(response.data) ? response.data[0] : response.data;
      return normalizeBudget(raw);
    } catch (e) {
      // Return a standard budget if server returns 404
      return { amount: 1500, month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    }
  },

  async create(budget: Budget): Promise<Budget> {
    const mode = getApiMode();
    if (mode === "demo") {
      demoDb.saveBudget(budget);
      return budget;
    }
    const response = await api.post("/budget", budget);
    return response.data;
  },

  async update(budget: Budget): Promise<Budget> {
    const mode = getApiMode();
    if (mode === "demo") {
      await new Promise((resolve) => setTimeout(resolve, 300));
      demoDb.saveBudget(budget);
      return budget;
    }
    // Try PUT /budget or POST /budget as a fallback
    try {
      const response = await api.put("/budget", budget);
      return response.data;
    } catch (e) {
      const response = await api.post("/budget", budget);
      return response.data;
    }
  }
};
