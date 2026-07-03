import { api, getApiMode, demoDb } from "./api";
import { Expense } from "../types";

export const ExpenseService = {
  async getAll(): Promise<Expense[]> {
    const mode = getApiMode();
    if (mode === "demo") {
      return demoDb.getExpenses();
    }
    const response = await api.get("/expenses");
    return response.data;
  },

  async getById(id: number): Promise<Expense> {
    const mode = getApiMode();
    if (mode === "demo") {
      const expenses = demoDb.getExpenses();
      const exp = expenses.find((e) => e.id === id);
      if (!exp) throw new Error("Dépense introuvable");
      return exp;
    }
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  async create(expense: any): Promise<Expense> {
    const mode = getApiMode();
    if (mode === "demo") {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const expenses = demoDb.getExpenses();
      const categories = demoDb.getCategories();
      
      const categoryId = Number(expense.categoryId || expense.category?.id);
      const category = categories.find((c) => c.id === categoryId) || categories[0];

      const newExpense: Expense = {
        id: Date.now(),
        title: expense.title,
        description: expense.description || "",
        amount: Number(expense.amount),
        expenseDate: expense.expenseDate,
        category: category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expenses.unshift(newExpense); // Add to the top
      demoDb.saveExpenses(expenses);
      return newExpense;
    }

    // Adapt payload to what the spring boot backend expects (usually category id or category object)
    const payload = {
      title: expense.title,
      description: expense.description || "",
      amount: Number(expense.amount),
      expenseDate: expense.expenseDate,
      categoryId: expense.categoryId || expense.category?.id,
      category: expense.category // pass both for compatibility
    };

    const response = await api.post("/expenses", payload);
    return response.data;
  },

  async update(id: number, expense: any): Promise<Expense> {
    const mode = getApiMode();
    if (mode === "demo") {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const expenses = demoDb.getExpenses();
      const categories = demoDb.getCategories();
      
      const index = expenses.findIndex((e) => e.id === id);
      if (index === -1) throw new Error("Dépense introuvable");

      const categoryId = Number(expense.categoryId || expense.category?.id);
      const category = categories.find((c) => c.id === categoryId) || categories[0];

      const updatedExpense: Expense = {
        ...expenses[index],
        title: expense.title,
        description: expense.description || "",
        amount: Number(expense.amount),
        expenseDate: expense.expenseDate,
        category: category,
        updatedAt: new Date().toISOString()
      };

      expenses[index] = updatedExpense;
      demoDb.saveExpenses(expenses);
      return updatedExpense;
    }

    const payload = {
      title: expense.title,
      description: expense.description || "",
      amount: Number(expense.amount),
      expenseDate: expense.expenseDate,
      categoryId: expense.categoryId || expense.category?.id,
      category: expense.category
    };

    const response = await api.put(`/expenses/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    const mode = getApiMode();
    if (mode === "demo") {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const expenses = demoDb.getExpenses();
      const filtered = expenses.filter((e) => e.id !== id);
      demoDb.saveExpenses(filtered);
      return;
    }
    await api.delete(`/expenses/${id}`);
  },

  async filter(params: { categoryId?: string; date?: string; title?: string }): Promise<Expense[]> {
    const mode = getApiMode();
    if (mode === "demo") {
      let expenses = demoDb.getExpenses();
      
      if (params.categoryId) {
        const catId = Number(params.categoryId);
        expenses = expenses.filter((e) => e.category.id === catId);
      }
      
      if (params.date) {
        expenses = expenses.filter((e) => e.expenseDate === params.date);
      }
      
      if (params.title) {
        const query = params.title.toLowerCase();
        expenses = expenses.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            (e.description && e.description.toLowerCase().includes(query))
        );
      }
      
      return expenses;
    }

    const queryParams = new URLSearchParams();
    if (params.categoryId) queryParams.append("category", params.categoryId);
    if (params.date) queryParams.append("date", params.date);
    if (params.title) queryParams.append("title", params.title);

    // Fallback if GET /expenses/filter doesn't exist, we fallback to local filtering
    try {
      const response = await api.get(`/expenses/filter?${queryParams.toString()}`);
      return response.data;
    } catch (e) {
      // Fallback client-side filtering on all expenses
      const allExpenses = await this.getAll();
      let filtered = [...allExpenses];
      if (params.categoryId) {
        const catId = Number(params.categoryId);
        filtered = filtered.filter(e => e.category?.id === catId);
      }
      if (params.date) {
        filtered = filtered.filter(e => e.expenseDate === params.date);
      }
      if (params.title) {
        const q = params.title.toLowerCase();
        filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
      }
      return filtered;
    }
  }
};
