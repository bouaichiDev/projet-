export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  expenseCount?: number;
}

export interface Expense {
  id: number;
  title: string;
  description: string;
  amount: number;
  expenseDate: string; // YYYY-MM-DD
  category: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  id?: number;
  amount: number;
  month: number;
  year: number;
}

export interface DashboardStats {
  monthlyBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  monthlyExpensesData: { name: string; montant: number }[];
  categoryDistribution: { name: string; value: number; color: string }[];
  recentExpenses: Expense[];
}

export interface HistoryPoint {
  date: string;
  montant: number;
}

export interface StatsOverview {
  barChartData: { month: string; Dépenses: number; Budget: number }[];
  pieChartData: { name: string; value: number; color: string }[];
  lineChartData: { date: string; Montant: number }[];
  categoryDistribution: { category: string; count: number; amount: number; percentage: number; color: string }[];
  monthlyEvolution: { month: string; amount: number; count: number }[];
  summary: {
    averageExpense: number;
    highestExpense: Expense | null;
    mostExpensiveCategory: { category: string; amount: number } | null;
    totalTransactions: number;
  };
}
