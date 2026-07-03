import axios from "axios";
import { User, Category, Expense, Budget, DashboardStats, StatsOverview } from "../types";

// Base URL of Spring Boot Backend API
const API_BASE_URL = "http://localhost:8090/api";

// Create Axios Instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Request Interceptor for JWT Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add Response Interceptor to unwrap the backend's ApiResponse envelope
// The Spring Boot backend wraps every payload as { success, message, data }.
// The frontend services expect the raw payload, so we unwrap `data` here once.
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      "data" in body
    ) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// CLIENT-SIDE DATABASE SIMULATOR (MODE DÉMO)
// -------------------------------------------------------------

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: "Alimentation", color: "#3B82F6", icon: "Utensils" }, // Blue
  { id: 2, name: "Loisirs & Sorties", color: "#EC4899", icon: "Gamepad" }, // Pink
  { id: 3, name: "Transport", color: "#10B981", icon: "Car" }, // Green
  { id: 4, name: "Logement & Factures", color: "#F59E0B", icon: "Home" }, // Orange
  { id: 5, name: "Santé & Bien-être", color: "#EF4444", icon: "HeartPulse" }, // Red
  { id: 6, name: "Éducation & Travail", color: "#8B5CF6", icon: "GraduationCap" }, // Purple
];

const DEFAULT_BUDGET: Budget = {
  amount: 1500,
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};

const DEFAULT_EXPENSES = (cats: Category[]): Expense[] => {
  const now = new Date();
  const formatOffsetDate = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(now.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  return [
    {
      id: 1,
      title: "Courses de la semaine - Auchan",
      description: "Fruits, légumes, laitages et épicerie",
      amount: 124.50,
      expenseDate: formatOffsetDate(1),
      category: cats[0], // Alimentation
    },
    {
      id: 2,
      title: "Abonnement Netflix",
      description: "Abonnement mensuel Standard HD",
      amount: 13.49,
      expenseDate: formatOffsetDate(3),
      category: cats[1], // Loisirs
    },
    {
      id: 3,
      title: "Plein d'essence Total",
      description: "Carburant pour aller au campus",
      amount: 75.00,
      expenseDate: formatOffsetDate(4),
      category: cats[2], // Transport
    },
    {
      id: 4,
      title: "Loyer mensuel Résidence",
      description: "Loyer du studio étudiant",
      amount: 550.00,
      expenseDate: formatOffsetDate(15),
      category: cats[3], // Logement
    },
    {
      id: 5,
      title: "Consultation Dentiste",
      description: "Visite annuelle de contrôle",
      amount: 28.00,
      expenseDate: formatOffsetDate(7),
      category: cats[4], // Santé
    },
    {
      id: 6,
      title: "Achat Livres Programmation Java",
      description: "Manuel pour les cours de Spring Boot",
      amount: 45.00,
      expenseDate: formatOffsetDate(10),
      category: cats[5], // Éducation
    },
    {
      id: 7,
      title: "Dîner Pizzeria avec amis",
      description: "Sortie de groupe fin de semaine",
      amount: 32.50,
      expenseDate: formatOffsetDate(2),
      category: cats[1], // Loisirs
    },
    {
      id: 8,
      title: "Ticket de bus mensuel",
      description: "Pass de transport étudiant",
      amount: 29.90,
      expenseDate: formatOffsetDate(18),
      category: cats[2], // Transport
    },
  ];
};

// Initialize simulated database in localStorage
export function initDemoDb() {
  if (!localStorage.getItem("demo_categories")) {
    localStorage.setItem("demo_categories", JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem("demo_expenses")) {
    const cats = JSON.parse(localStorage.getItem("demo_categories")!) as Category[];
    localStorage.setItem("demo_expenses", JSON.stringify(DEFAULT_EXPENSES(cats)));
  }
  if (!localStorage.getItem("demo_budget")) {
    localStorage.setItem("demo_budget", JSON.stringify(DEFAULT_BUDGET));
  }
  if (!localStorage.getItem("demo_user")) {
    localStorage.setItem(
      "demo_user",
      JSON.stringify({
        id: 999,
        firstname: "Lucas",
        lastname: "Martin",
        email: "lucas.martin@univ-paris.fr",
      })
    );
  }
}

// Check api mode setting (defaults to "demo" so the preview is immediately beautiful and interactive!)
export function getApiMode(): "real" | "demo" {
  const mode = localStorage.getItem("api_mode");
  if (!mode) {
    // Default to "real" so the frontend talks to the Spring Boot backend.
    localStorage.setItem("api_mode", "real");
    return "real";
  }
  return mode as "real" | "demo";
}

export function setApiMode(mode: "real" | "demo") {
  localStorage.setItem("api_mode", mode);
  window.dispatchEvent(new Event("api_mode_changed"));
}

// Retrieve data from simulator
export const demoDb = {
  getCategories(): Category[] {
    initDemoDb();
    return JSON.parse(localStorage.getItem("demo_categories")!);
  },
  saveCategories(cats: Category[]) {
    localStorage.setItem("demo_categories", JSON.stringify(cats));
  },
  getExpenses(): Expense[] {
    initDemoDb();
    return JSON.parse(localStorage.getItem("demo_expenses")!);
  },
  saveExpenses(exps: Expense[]) {
    localStorage.setItem("demo_expenses", JSON.stringify(exps));
  },
  getBudget(): Budget {
    initDemoDb();
    return JSON.parse(localStorage.getItem("demo_budget")!);
  },
  saveBudget(b: Budget) {
    localStorage.setItem("demo_budget", JSON.stringify(b));
  },
  getUser(): User {
    initDemoDb();
    return JSON.parse(localStorage.getItem("demo_user")!);
  },
  saveUser(u: User) {
    localStorage.setItem("demo_user", JSON.stringify(u));
  }
};
