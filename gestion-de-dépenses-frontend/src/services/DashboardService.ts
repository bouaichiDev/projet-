import { api, getApiMode, demoDb } from "./api";
import { DashboardStats, StatsOverview, Expense, Category } from "../types";

export const DashboardService = {
  async getDashboardData(): Promise<DashboardStats> {
    const mode = getApiMode();
    if (mode === "demo") {
      const budget = demoDb.getBudget();
      const expenses = demoDb.getExpenses();
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Current month expenses
      const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.expenseDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const remainingBudget = Math.max(0, budget.amount - totalExpenses);

      // Group recent 5 months for comparison
      const monthsFrench = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
      const monthlyMap: Record<string, number> = {};
      
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const mName = `${monthsFrench[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        monthlyMap[mName] = 0;
      }

      expenses.forEach(e => {
        const d = new Date(e.expenseDate);
        const mName = `${monthsFrench[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        if (mName in monthlyMap) {
          monthlyMap[mName] += e.amount;
        }
      });

      const monthlyExpensesData = Object.entries(monthlyMap).map(([name, montant]) => ({
        name,
        montant: Number(montant.toFixed(2))
      }));

      // Category distribution
      const categoryMap: Record<string, { value: number; color: string }> = {};
      currentMonthExpenses.forEach(e => {
        const catName = e.category.name;
        if (!categoryMap[catName]) {
          categoryMap[catName] = { value: 0, color: e.category.color };
        }
        categoryMap[catName].value += e.amount;
      });

      const categoryDistribution = Object.entries(categoryMap).map(([name, data]) => ({
        name,
        value: Number(data.value.toFixed(2)),
        color: data.color
      }));

      // If empty, fill with standard category placeholder
      if (categoryDistribution.length === 0) {
        const categories = demoDb.getCategories();
        categories.slice(0, 3).forEach((cat, idx) => {
          categoryDistribution.push({
            name: cat.name,
            value: idx === 0 ? 100 : 50,
            color: cat.color
          });
        });
      }

      // Recent expenses
      const recentExpenses = [...expenses]
        .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
        .slice(0, 5);

      return {
        monthlyBudget: budget.amount,
        totalExpenses: Number(totalExpenses.toFixed(2)),
        remainingBudget: Number(remainingBudget.toFixed(2)),
        monthlyExpensesData,
        categoryDistribution,
        recentExpenses
      };
    }

    try {
      const response = await api.get("/dashboard");
      return response.data;
    } catch (e) {
      // Graceful fallback to client calculations if backend fails
      return this.fallbackDashboardData();
    }
  },

  async getStatistics(): Promise<StatsOverview> {
    const mode = getApiMode();
    if (mode === "demo") {
      const budget = demoDb.getBudget();
      const expenses = demoDb.getExpenses();
      const categories = demoDb.getCategories();

      const now = new Date();
      
      // Calculate 6-month comparisons
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
          longLabel: monthsFrench[d.getMonth()]
        });
      }

      const barChartData = last6Months.map(m => {
        const monthExps = expenses.filter(e => {
          const ed = new Date(e.expenseDate);
          return ed.getMonth() === m.monthIndex && ed.getFullYear() === m.year;
        });
        const total = monthExps.reduce((sum, e) => sum + e.amount, 0);
        return {
          month: m.shortLabel,
          Dépenses: Number(total.toFixed(2)),
          Budget: budget.amount
        };
      });

      // Pie chart data (all-time category distribution)
      const catTotals: Record<number, { name: string; amount: number; color: string }> = {};
      categories.forEach(c => {
        catTotals[c.id] = { name: c.name, amount: 0, color: c.color };
      });

      expenses.forEach(e => {
        if (catTotals[e.category.id]) {
          catTotals[e.category.id].amount += e.amount;
        } else {
          catTotals[e.category.id] = { name: e.category.name, amount: e.amount, color: e.category.color };
        }
      });

      const pieChartData = Object.values(catTotals)
        .filter(c => c.amount > 0)
        .map(c => ({
          name: c.name,
          value: Number(c.amount.toFixed(2)),
          color: c.color
        }));

      // Line Chart data (Expenses in current month, cumulative by date)
      const currentMonthExpenses = expenses.filter(e => {
        const ed = new Date(e.expenseDate);
        return ed.getMonth() === now.getMonth() && ed.getFullYear() === now.getFullYear();
      }).sort((a, b) => new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime());

      const lineChartData: { date: string; Montant: number }[] = [];
      let cumulativeSum = 0;
      
      // Group by date
      const dateMap: Record<string, number> = {};
      // Initialize past 15 days
      for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        dateMap[dateStr] = 0;
      }

      currentMonthExpenses.forEach(e => {
        if (e.expenseDate in dateMap) {
          dateMap[e.expenseDate] += e.amount;
        } else {
          // If outside initialized 15 days, still support
          dateMap[e.expenseDate] = e.amount;
        }
      });

      // Sort dates
      const sortedDates = Object.keys(dateMap).sort();
      sortedDates.forEach(date => {
        cumulativeSum += dateMap[date];
        const displayDate = date.split("-").slice(2).join("/") + "/" + date.split("-")[1]; // DD/MM
        lineChartData.push({
          date: displayDate,
          Montant: Number(cumulativeSum.toFixed(2))
        });
      });

      // Table representation for categories distribution
      const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0) || 1;
      const categoryDistribution = Object.entries(catTotals).map(([idStr, data]) => {
        const count = expenses.filter(e => e.category.id === Number(idStr)).length;
        return {
          category: data.name,
          count,
          amount: Number(data.amount.toFixed(2)),
          percentage: Number(((data.amount / totalAll) * 100).toFixed(1)),
          color: data.color
        };
      }).sort((a, b) => b.amount - a.amount);

      // Monthly evolution list
      const monthlyEvolution = last6Months.map(m => {
        const monthExps = expenses.filter(e => {
          const ed = new Date(e.expenseDate);
          return ed.getMonth() === m.monthIndex && ed.getFullYear() === m.year;
        });
        const total = monthExps.reduce((sum, e) => sum + e.amount, 0);
        return {
          month: m.longLabel,
          amount: Number(total.toFixed(2)),
          count: monthExps.length
        };
      });

      // Summary
      const averageExpense = expenses.length > 0 ? (totalAll / expenses.length) : 0;
      const highestExpense = expenses.length > 0 ? [...expenses].sort((a, b) => b.amount - a.amount)[0] : null;
      
      const highestCat = [...categoryDistribution].sort((a, b) => b.amount - a.amount)[0];
      const mostExpensiveCategory = highestCat ? { category: highestCat.category, amount: highestCat.amount } : null;

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
          totalTransactions: expenses.length
        }
      };
    }

    try {
      const response = await api.get("/dashboard/statistics");
      return response.data;
    } catch (e) {
      return this.fallbackStatistics();
    }
  },

  // Fallbacks in case backend throws errors
  async fallbackDashboardData(): Promise<DashboardStats> {
    const budget = { amount: 1500 };
    const expenses: Expense[] = [];
    return {
      monthlyBudget: budget.amount,
      totalExpenses: 0,
      remainingBudget: budget.amount,
      monthlyExpensesData: [],
      categoryDistribution: [],
      recentExpenses: []
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
        totalTransactions: 0
      }
    };
  }
};
