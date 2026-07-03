import { api, getApiMode, demoDb } from "./api";
import { Budget } from "../types";

export const BudgetService = {
  async get(): Promise<Budget> {
    const mode = getApiMode();
    if (mode === "demo") {
      return demoDb.getBudget();
    }
    try {
      const response = await api.get("/budget");
      // Handle array vs object responses
      if (Array.isArray(response.data)) {
        return response.data[0] || { amount: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear() };
      }
      return response.data;
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
