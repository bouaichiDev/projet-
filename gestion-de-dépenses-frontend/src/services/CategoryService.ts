import { api, getApiMode, demoDb } from "./api";
import { Category } from "../types";

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    const mode = getApiMode();
    if (mode === "demo") {
      const categories = demoDb.getCategories();
      const expenses = demoDb.getExpenses();
      
      // Calculate expense counts
      return categories.map((cat) => {
        const count = expenses.filter((e) => e.category.id === cat.id).length;
        return {
          ...cat,
          expenseCount: count,
        };
      });
    }

    const response = await api.get("/categories");
    // Optionally fetch expense count in background or set to 0
    return response.data;
  },

  async create(category: any): Promise<Category> {
    const mode = getApiMode();
    if (mode === "demo") {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const categories = demoDb.getCategories();
      
      const newCategory: Category = {
        id: Date.now(),
        name: category.name,
        color: category.color || "#3B82F6",
        icon: category.icon || "Folder",
        expenseCount: 0
      };

      categories.push(newCategory);
      demoDb.saveCategories(categories);
      return newCategory;
    }

    const response = await api.post("/categories", category);
    return response.data;
  },

  async update(id: number, category: any): Promise<Category> {
    const mode = getApiMode();
    if (mode === "demo") {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const categories = demoDb.getCategories();
      const index = categories.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Catégorie introuvable");

      const updatedCategory: Category = {
        ...categories[index],
        name: category.name,
        color: category.color || categories[index].color,
        icon: category.icon || categories[index].icon,
      };

      categories[index] = updatedCategory;
      demoDb.saveCategories(categories);

      // Cascade update in expenses
      const expenses = demoDb.getExpenses();
      const updatedExpenses = expenses.map((e) => {
        if (e.category.id === id) {
          return { ...e, category: updatedCategory };
        }
        return e;
      });
      demoDb.saveExpenses(updatedExpenses);

      return updatedCategory;
    }

    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    const mode = getApiMode();
    if (mode === "demo") {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const categories = demoDb.getCategories();
      const filtered = categories.filter((c) => c.id !== id);
      demoDb.saveCategories(filtered);

      // Cascade delete or re-assign expenses to Alimentation (1) or delete
      const expenses = demoDb.getExpenses();
      const filteredExpenses = expenses.filter((e) => e.category.id !== id);
      demoDb.saveExpenses(filteredExpenses);
      return;
    }
    await api.delete(`/categories/${id}`);
  }
};
