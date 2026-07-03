import { getApiMode, demoDb } from "./api";
import { ExpenseService } from "./ExpenseService";
import { BudgetService } from "./BudgetService";
import { CategoryService } from "./CategoryService";
import { DashboardStats, StatsOverview, Expense, Budget, Category } from "../types";

// -------------------------------------------------------------
// Pure computations shared by demo mode and real (backend) mode.
// The Spring Boot /dashboard endpoints return a different DTO shape
// than the UI expects, so in both modes we derive the dashboard and
// statistics from the raw expenses/budget/categories instead.
// -------------------------------------------------------------

function buildDashboardStats(expenses: Expense[], budget: Budget): DashboardStats {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const budgetAmount = budget?.amount ?? 0;

  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = Math.max(0, budgetAmount - totalExpenses);

  // Last 6 months bar data
  const monthsShort = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const monthlyMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    const mName = `${monthsShort[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    monthlyMap[mName] = 0;
  }
  expenses.forEach((e) => {
    const d = new Date(e.expenseDate);
    const mName = `${monthsShort[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    if (mName in monthlyMap) {
      monthlyMap[mName] += e.amount;
    }
  });
  const monthlyExpensesData = Object.entries(monthlyMap).map(([name, montant]) => ({
    name,
    montant: Number(montant.toFixed(2)),
  }));

  // Category distribution (current month)
  const categoryMap: Record<string, { value: number; color: string }> = {};
  currentMonthExpenses.forEach((e) => {
    if (!e.category) return;
    const catName = e.category.name;
    if (!categoryMap[catName]) {
      categoryMap[catName] = { value: 0, color: e.category.color };
    }
    categoryMap[catName].value += e.amount;
  });
  const categoryDistribution = Object.entries(categoryMap).map(([name, d]) => ({
    name,
    value: Number(d.value.toFixed(2)),
    color: d.color,
  }));

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
    .slice(0, 5);

  return {
    monthlyBudget: budgetAmount,
    totalExpenses: Number(totalExpenses.toFixed(2)),
    remainingBudget: Number(remainingBudget.toFixed(2)),
    monthlyExpensesData,
    categoryDistribution,
    recentExpenses,
  };
}

function buildStatsOverview(expenses: Expense[], budget: Budget, categories: Category[]): StatsOverview {
  const now = new Date();
  const budgetAmount = budget?.amount ?? 0;

  const monthsFrench = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const monthsShort = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    last6Months.push({
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      shortLabel: monthsShort[d.getMonth()],
      longLabel: monthsFrench[d.getMonth()],
    });
  }

  const barChartData = last6Months.map((m) => {
    const monthExps = expenses.filter((e) => {
      const ed = new Date(e.expenseDate);
      return ed.getMonth() === m.monthIndex && ed.getFullYear() === m.year;
    });
    const total = monthExps.reduce((sum, e) => sum + e.amount, 0);
    return {
      month: m.shortLabel,
      Dépenses: Number(total.toFixed(2)),
      Budget: budgetAmount,
    };
  });

  // Pie chart data (all-time category distribution)
  const catTotals: Record<number, { name: string; amount: number; color: string }> = {};
  categories.forEach((c) => {
    catTotals[c.id] = { name: c.name, amount: 0, color: c.color };
  });
  expenses.forEach((e) => {
    if (!e.category) return;
    if (catTotals[e.category.id]) {
      catTotals[e.category.id].amount += e.amount;
    } else {
      catTotals[e.category.id] = { name: e.category.name, amount: e.amount, color: e.category.color };
    }
  });

  const pieChartData = Object.values(catTotals)
    .filter((c) => c.amount > 0)
    .map((c) => ({
      name: c.name,
      value: Number(c.amount.toFixed(2)),
      color: c.color,
    }));

  // Line chart data (cumulative over the last 15 days)
  const dateMap: Record<string, number> = {};
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    dateMap[dateStr] = 0;
  }
  expenses.forEach((e) => {
    if (e.expenseDate in dateMap) {
      dateMap[e.expenseDate] += e.amount;
    } else {
      dateMap[e.expenseDate] = e.amount;
    }
  });

  const lineChartData: { date: string; Montant: number }[] = [];
  let cumulativeSum = 0;
  const sortedDates = Object.keys(dateMap).sort();
  sortedDates.forEach((date) => {
    cumulativeSum += dateMap[date];
    const parts = date.split("-");
    const displayDate = parts[2] + "/" + parts[1]; // DD/MM
    lineChartData.push({
      date: displayDate,
      Montant: Number(cumulativeSum.toFixed(2)),
    });
  });

  // Table representation for categories distribution
  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0) || 1;
  const categoryDistribution = Object.entries(catTotals)
    .map(([idStr, data]) => {
      const count = expenses.filter((e) => e.category?.id === Number(idStr)).length;
      return {
        category: data.name,
        count,
        amount: Number(data.amount.toFixed(2)),
        percentage: Number(((data.amount / totalAll) * 100).toFixed(1)),
        color: data.color,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Monthly evolution list
  const monthlyEvolution = last6Months.map((m) => {
    const monthExps = expenses.filter((e) => {
      const ed = new Date(e.expenseDate);
      return ed.getMonth() === m.monthIndex && ed.getFullYear() === m.year;
    });
    const total = monthExps.reduce((sum, e) => sum + e.amount, 0);
    return {
      month: m.longLabel,
      amount: Number(total.toFixed(2)),
      count: monthExps.length,
    };
  });

  // Summary
  const averageExpense = expenses.length > 0 ? totalAll / expenses.length : 0;
  const highestExpense = expenses.length > 0 ? [...expenses].sort((a, b) => b.amount - a.amount)[0] : null;
  const highestCat = [...categoryDistribution].sort((a, b) => b.amount - a.amount)[0];
  const mostExpensiveCategory = highestCat && highestCat.amount > 0
    ? { category: highestCat.category, amount: highestCat.amount }
    : null;

  return {
    barChartData,
    pieChartData,
    lineChartData,
    categoryDistribution,
    monthlyEvolution,
    summary: {
      averageExpense: Number(averageExpense.toFixed(2)),
      highestExpense,
      mostExpensiveCategory,
      totalTransactions: expenses.length,
    },
  };
}

export const DashboardService = {
  async getDashboardData(): Promise<DashboardStats> {
    try {
      if (getApiMode() === "demo") {
        return buildDashboardStats(demoDb.getExpenses(), demoDb.getBudget());
      }
      const [expenses, budget] = await Promise.all([
        ExpenseService.getAll(),
        BudgetService.get(),
      ]);
      return buildDashboardStats(expenses, budget);
    } catch (e) {
      // Graceful fallback if the backend is unreachable
      return this.fallbackDashboardData();
    }
  },

  async getStatistics(): Promise<StatsOverview> {
    try {
      if (getApiMode() === "demo") {
        return buildStatsOverview(demoDb.getExpenses(), demoDb.getBudget(), demoDb.getCategories());
      }
      const [expenses, budget, categories] = await Promise.all([
        ExpenseService.getAll(),
        BudgetService.get(),
        CategoryService.getAll(),
      ]);
      return buildStatsOverview(expenses, budget, categories);
    } catch (e) {
      return this.fallbackStatistics();
    }
  },

  // Fallbacks in case backend throws errors
  async fallbackDashboardData(): Promise<DashboardStats> {
    const budgetAmount = 1500;
    return {
      monthlyBudget: budgetAmount,
      totalExpenses: 0,
      remainingBudget: budgetAmount,
      monthlyExpensesData: [],
      categoryDistribution: [],
      recentExpenses: [],
    };
  },

  async fallbackStatistics(): Promise<StatsOverview> {
    return {
      barChartData: [],
      pieChartData: [],
      lineChartData: [],
      categoryDistribution: [],
      monthlyEvolution: [],
      summary: {
        averageExpense: 0,
        highestExpense: null,
        mostExpensiveCategory: null,
        totalTransactions: 0,
      },
    };
  },
};
