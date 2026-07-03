import React, { useState, useEffect } from "react";
import { 
  Folder, 
  File, 
  Terminal, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  ShieldCheck, 
  BookOpen, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Code, 
  Cpu, 
  HelpCircle, 
  Layers, 
  ArrowRight,
  Sparkles,
  Info,
  RefreshCw,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types for Project Explorer
interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

// Simulated State for the API Playground
interface MockUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  createdAt: string;
}

interface MockCategory {
  id: number;
  name: string;
  color: string;
  icon: string;
}

interface MockExpense {
  id: number;
  title: string;
  description: string;
  amount: number;
  expenseDate: string;
  category: MockCategory;
  createdAt: string;
  updatedAt: string;
}

interface MockBudget {
  amount: number;
  month: number;
  year: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"explorer" | "swagger">("explorer");
  const [selectedFilePath, setSelectedFilePath] = useState<string>("/backend/README.md");
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "backend": true,
    "backend/src": true,
    "backend/src/main": true,
    "backend/src/main/java": true,
    "backend/src/main/java/com": true,
    "backend/src/main/java/com/expensetracker": true,
    "backend/src/main/java/com/expensetracker/entity": true,
    "backend/src/main/java/com/expensetracker/controller": true,
    "backend/src/main/resources": true,
  });

  // API Simulation states
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [categories, setCategories] = useState<MockCategory[]>([
    { id: 1, name: "Alimentation", color: "#EF4444", icon: "Utensils" },
    { id: 2, name: "Loisirs", color: "#3B82F6", icon: "Gamepad" },
    { id: 3, name: "Transport", color: "#10B981", icon: "Car" },
    { id: 4, name: "Logement", color: "#F59E0B", icon: "Home" }
  ]);
  const [expenses, setExpenses] = useState<MockExpense[]>([
    {
      id: 1,
      title: "Courses hebdomadaires Carrefour",
      description: "Achat de fruits, légumes et produits laitiers pour la semaine",
      amount: 84.50,
      expenseDate: "2026-07-01",
      category: { id: 1, name: "Alimentation", color: "#EF4444", icon: "Utensils" },
      createdAt: "2026-07-01T10:15:00Z",
      updatedAt: "2026-07-01T10:15:00Z"
    },
    {
      id: 2,
      title: "Abonnement Netflix",
      description: "Abonnement mensuel formule Premium 4K",
      amount: 19.99,
      expenseDate: "2026-06-28",
      category: { id: 2, name: "Loisirs", color: "#3B82F6", icon: "Gamepad" },
      createdAt: "2026-06-28T08:00:00Z",
      updatedAt: "2026-06-28T08:00:00Z"
    },
    {
      id: 3,
      title: "Plein d'essence",
      description: "Station Total, carburant sans plomb 98",
      amount: 75.00,
      expenseDate: "2026-06-25",
      category: { id: 3, name: "Transport", color: "#10B981", icon: "Car" },
      createdAt: "2026-06-25T17:45:00Z",
      updatedAt: "2026-06-25T17:45:00Z"
    },
    {
      id: 4,
      title: "Loyer Juillet 2026",
      description: "Virement loyer appartement principal",
      amount: 650.00,
      expenseDate: "2026-07-01",
      category: { id: 4, name: "Logement", color: "#F59E0B", icon: "Home" },
      createdAt: "2026-07-01T09:00:00Z",
      updatedAt: "2026-07-01T09:00:00Z"
    }
  ]);
  const [monthlyBudget, setMonthlyBudget] = useState<MockBudget>({
    amount: 1000.00,
    month: 7,
    year: 2026
  });

  // Current date for simulation
  const [simulatedTime, setSimulatedTime] = useState<string>("2026-07-01 10:48:00");

  // Endpoint forms / requests states
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("POST /auth/register");
  const [reqBody, setReqBody] = useState<string>("{\n  \"firstname\": \"Jean\",\n  \"lastname\": \"Dupont\",\n  \"email\": \"jean.dupont@email.com\",\n  \"password\": \"password123\"\n}");
  const [apiResponse, setApiResponse] = useState<string>("{\n  \"message\": \"Sélectionnez un endpoint et cliquez sur \\\"Envoyer la requête\\\" pour lancer la simulation.\"\n}");
  const [apiStatus, setApiStatus] = useState<string>("200 OK");
  const [apiSuccess, setApiSuccess] = useState<boolean>(true);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  // Auto update endpoint body on endpoint select
  useEffect(() => {
    switch (selectedEndpoint) {
      case "POST /auth/register":
        setReqBody(JSON.stringify({
          firstname: "Jean",
          lastname: "Dupont",
          email: "jean.dupont@email.com",
          password: "password123"
        }, null, 2));
        break;
      case "POST /auth/login":
        setReqBody(JSON.stringify({
          email: "jean.dupont@email.com",
          password: "password123"
        }, null, 2));
        break;
      case "GET /categories":
        setReqBody("");
        break;
      case "POST /categories":
        setReqBody(JSON.stringify({
          name: "Santé",
          color: "#8B5CF6",
          icon: "Heart"
        }, null, 2));
        break;
      case "GET /expenses":
        setReqBody("");
        break;
      case "POST /expenses":
        setReqBody(JSON.stringify({
          title: "Consultation Dentiste",
          description: "Remboursement partiel mutuelle attendu",
          amount: 60.00,
          expenseDate: "2026-07-01",
          categoryId: 1
        }, null, 2));
        break;
      case "GET /expenses/filter":
        setReqBody("// Paramètres URL simulés :\n// ?categoryId=1&minAmount=50.0");
        break;
      case "GET /budget":
        setReqBody("// Optionnel : ?month=7&year=2026");
        break;
      case "POST /budget":
      case "PUT /budget":
        setReqBody(JSON.stringify({
          amount: 1200.00,
          month: 7,
          year: 2026
        }, null, 2));
        break;
      case "GET /dashboard":
      case "GET /dashboard/statistics":
        setReqBody("");
        break;
      default:
        setReqBody("");
    }
  }, [selectedEndpoint]);

  // Folder toggle helper
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  // API Execution Simulation
  const executeApiCall = () => {
    setIsLoadingApi(true);
    setTimeout(() => {
      setIsLoadingApi(false);
      try {
        const parsedBody = reqBody && !reqBody.startsWith("//") ? JSON.parse(reqBody) : {};
        
        switch (selectedEndpoint) {
          case "POST /auth/register": {
            if (!parsedBody.firstname || !parsedBody.lastname || !parsedBody.email || !parsedBody.password) {
              setApiStatus("400 Bad Request");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Validation failed",
                data: {
                  firstname: parsedBody.firstname ? null : "First name is required",
                  lastname: parsedBody.lastname ? null : "Last name is required",
                  email: parsedBody.email ? null : "Email is required",
                  password: parsedBody.password ? null : "Password is required"
                }
              }, null, 2));
              return;
            }
            if (parsedBody.password.length < 6) {
              setApiStatus("400 Bad Request");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Validation failed",
                data: {
                  password: "Password must be at least 6 characters"
                }
              }, null, 2));
              return;
            }

            setApiStatus("201 Created");
            setApiSuccess(true);
            setApiResponse(JSON.stringify({
              success: true,
              message: "User registered successfully",
              data: {
                id: 12,
                firstname: parsedBody.firstname,
                lastname: parsedBody.lastname,
                email: parsedBody.email,
                createdAt: new Date().toISOString()
              }
            }, null, 2));
            break;
          }

          case "POST /auth/login": {
            if (!parsedBody.email || !parsedBody.password) {
              setApiStatus("400 Bad Request");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Validation failed",
                data: {
                  email: parsedBody.email ? null : "Email is required",
                  password: parsedBody.password ? null : "Password is required"
                }
              }, null, 2));
              return;
            }

            const mockToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqZWFuLmR1cG9udEBlbWFpbC5jb20iLCJpYXQiOjE3ODY0MTY0OTEsImV4cCI6MTc4NjUwMjg5MX0.mock_signature_x982348_expensetracker";
            setAuthToken(mockToken);
            setCurrentUser({
              id: 12,
              firstname: "Jean",
              lastname: "Dupont",
              email: parsedBody.email,
              createdAt: "2026-07-01T10:00:00Z"
            });

            setApiStatus("200 OK");
            setApiSuccess(true);
            setApiResponse(JSON.stringify({
              success: true,
              message: "Authentication successful",
              data: {
                token: mockToken,
                type: "Bearer",
                id: 12,
                firstname: "Jean",
                lastname: "Dupont",
                email: parsedBody.email
              }
            }, null, 2));
            break;
          }

          case "GET /categories": {
            if (!authToken) {
              setApiStatus("401 Unauthorized");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Unauthorized access: Full authentication is required to access this resource",
                data: null
              }, null, 2));
              return;
            }

            setApiStatus("200 OK");
            setApiSuccess(true);
            setApiResponse(JSON.stringify({
              success: true,
              message: "Categories retrieved successfully",
              data: categories
            }, null, 2));
            break;
          }

          case "POST /categories": {
            if (!authToken) {
              setApiStatus("401 Unauthorized");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Unauthorized access: JWT Bearer Token required",
                data: null
              }, null, 2));
              return;
            }

            if (!parsedBody.name || !parsedBody.color || !parsedBody.icon) {
              setApiStatus("400 Bad Request");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Validation failed",
                data: {
                  name: parsedBody.name ? null : "Category name is required",
                  color: parsedBody.color ? null : "Color is required",
                  icon: parsedBody.icon ? null : "Icon name is required"
                }
              }, null, 2));
              return;
            }

            const duplicate = categories.some(c => c.name.toLowerCase() === parsedBody.name.toLowerCase());
            if (duplicate) {
              setApiStatus("400 Bad Request");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Category with name '" + parsedBody.name + "' already exists",
                data: null
              }, null, 2));
              return;
            }

            const newCat: MockCategory = {
              id: categories.length + 1,
              name: parsedBody.name,
              color: parsedBody.color,
              icon: parsedBody.icon
            };

            setCategories(prev => [...prev, newCat]);
            setApiStatus("201 Created");
            setApiSuccess(true);
            setApiResponse(JSON.stringify({
              success: true,
              message: "Category created successfully",
              data: newCat
            }, null, 2));
            break;
          }

          case "GET /expenses": {
            if (!authToken) {
              setApiStatus("401 Unauthorized");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Unauthorized access: JWT Bearer Token required",
                data: null
              }, null, 2));
              return;
            }

            setApiStatus("200 OK");
            setApiSuccess(true);
            setApiResponse(JSON.stringify({
              success: true,
              message: "Expenses retrieved successfully",
              data: expenses
            }, null, 2));
            break;
          }

          case "POST /expenses": {
            if (!authToken) {
              setApiStatus("401 Unauthorized");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Unauthorized access: JWT Bearer Token required",
                data: null
              }, null, 2));
              return;
            }

            if (!parsedBody.title || parsedBody.amount === undefined || !parsedBody.expenseDate || !parsedBody.categoryId) {
              setApiStatus("400 Bad Request");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Validation failed",
                data: {
                  title: parsedBody.title ? null : "Title is required",
                  amount: parsedBody.amount ? null : "Amount is required",
                  expenseDate: parsedBody.expenseDate ? null : "Expense date is required",
                  categoryId: parsedBody.categoryId ? null : "Category ID is required"
                }
              }, null, 2));
              return;
            }

            if (parsedBody.amount <= 0) {
              setApiStatus("400 Bad Request");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Validation failed",
                data: {
                  amount: "Amount must be strictly positive"
                }
              }, null, 2));
              return;
            }

            const selectedCat = categories.find(c => c.id === Number(parsedBody.categoryId)) || categories[0];

            const newExpense: MockExpense = {
              id: expenses.length + 1,
              title: parsedBody.title,
              description: parsedBody.description || "",
              amount: Number(parsedBody.amount),
              expenseDate: parsedBody.expenseDate,
              category: selectedCat,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            setExpenses(prev => [newExpense, ...prev]);
            setApiStatus("201 Created");
            setApiSuccess(true);
            setApiResponse(JSON.stringify({
              success: true,
              message: "Expense logged successfully",
              data: newExpense
            }, null, 2));
            break;
          }

          case "GET /expenses/filter": {
            if (!authToken) {
              setApiStatus("401 Unauthorized");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Unauthorized access: JWT Bearer Token required",
                data: null
              }, null, 2));
              return;
            }

            // Simulating filter of Alimentation (id 1)
            const filtered = expenses.filter(e => e.category.id === 1);
            setApiStatus("200 OK");
            setApiSuccess(true);
            setApiResponse(JSON.stringify({
              success: true,
              message: "Filtered expenses retrieved successfully",
              data: filtered
            }, null, 2));
            break;
          }

          case "GET /budget": {
            if (!authToken) {
              setApiStatus("401 Unauthorized");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Unauthorized access: JWT Bearer Token required",
                data: null
              }, null, 2));
              return;
            }

            const currentMonthExpensesSum = expenses
              .filter(e => e.expenseDate.startsWith("2026-07"))
              .reduce((sum, e) => sum + e.amount, 0);

            const remaining = monthlyBudget.amount - currentMonthExpensesSum;
            const pct = monthlyBudget.amount > 0 ? (currentMonthExpensesSum / monthlyBudget.amount) * 100 : 0;
            const isExceeded = currentMonthExpensesSum > monthlyBudget.amount;

            setApiStatus("200 OK");
            setApiSuccess(true);
            setApiResponse(JSON.stringify({
              success: true,
              message: "Monthly budget status retrieved successfully",
              data: {
                budgetAmount: monthlyBudget.amount,
                totalExpenses: currentMonthExpensesSum,
                remainingAmount: remaining,
                percentageConsumed: pct,
                warning: isExceeded,
                message: isExceeded ? "Budget dépassé" : "Budget respecté"
              }
            }, null, 2));
            break;
          }

          case "POST /budget":
          case "PUT /budget": {
            if (!authToken) {
              setApiStatus("401 Unauthorized");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Unauthorized access: JWT Bearer Token required",
                data: null
              }, null, 2));
              return;
            }

            if (parsedBody.amount === undefined || !parsedBody.month || !parsedBody.year) {
              setApiStatus("400 Bad Request");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Validation failed",
                data: {
                  amount: parsedBody.amount ? null : "Amount is required",
                  month: parsedBody.month ? null : "Month is required",
                  year: parsedBody.year ? null : "Year is required"
                }
              }, null, 2));
              return;
            }

            setMonthlyBudget({
              amount: Number(parsedBody.amount),
              month: Number(parsedBody.month),
              year: Number(parsedBody.year)
            });

            setApiStatus("200 OK");
            setApiSuccess(true);
            setApiResponse(JSON.stringify({
              success: true,
              message: "Budget updated successfully",
              data: {
                id: 1,
                amount: Number(parsedBody.amount),
                month: Number(parsedBody.month),
                year: Number(parsedBody.year),
                createdAt: "2026-07-01T08:00:00Z",
                updatedAt: new Date().toISOString()
              }
            }, null, 2));
            break;
          }

          case "GET /dashboard":
          case "GET /dashboard/statistics": {
            if (!authToken) {
              setApiStatus("401 Unauthorized");
              setApiSuccess(false);
              setApiResponse(JSON.stringify({
                success: false,
                message: "Unauthorized access: JWT Bearer Token required",
                data: null
              }, null, 2));
              return;
            }

            const total = expenses.reduce((sum, e) => sum + e.amount, 0);
            const thisMonthExpenses = expenses
              .filter(e => e.expenseDate.startsWith("2026-07"))
              .reduce((sum, e) => sum + e.amount, 0);

            // Group by category
            const categorySums: Record<string, number> = {};
            expenses.forEach(e => {
              categorySums[e.category.name] = (categorySums[e.category.name] || 0) + e.amount;
            });

            const topCats = Object.entries(categorySums).map(([name, sum]) => {
              const catObj = categories.find(c => c.name === name) || categories[0];
              return {
                categoryName: name,
                color: catObj.color,
                icon: catObj.icon,
                totalAmount: sum,
                percentage: total > 0 ? (sum / total) * 100 : 0
              };
            }).sort((a, b) => b.totalAmount - a.totalAmount);

            setApiStatus("200 OK");
            setApiSuccess(true);
            setApiResponse(JSON.stringify({
              success: true,
              message: "Dashboard statistics retrieved successfully",
              data: {
                totalExpenses: total,
                currentMonthExpenses: thisMonthExpenses,
                totalExpenseCount: expenses.length,
                expensesByCategory: categorySums,
                topCategories: topCats,
                monthlyEvolution: {
                  "2026-05": 320.00,
                  "2026-06": 550.45,
                  "2026-07": thisMonthExpenses
                }
              }
            }, null, 2));
            break;
          }

          default:
            setApiStatus("404 Not Found");
            setApiSuccess(false);
            setApiResponse(JSON.stringify({ success: false, message: "Endpoint simulation not found" }, null, 2));
        }
      } catch (err: any) {
        setApiStatus("500 Internal Server Error");
        setApiSuccess(false);
        setApiResponse(JSON.stringify({ success: false, message: "JSON Parse error in Request Body: " + err.message }, null, 2));
      }
    }, 400);
  };

  // Helper for rendering endpoint badges
  const getMethodColor = (endpoint: string) => {
    if (endpoint.startsWith("GET")) return "bg-blue-900/40 text-blue-300 border-blue-700/50";
    if (endpoint.startsWith("POST")) return "bg-emerald-900/40 text-emerald-300 border-emerald-700/50";
    if (endpoint.startsWith("PUT")) return "bg-amber-900/40 text-amber-300 border-amber-700/50";
    if (endpoint.startsWith("DELETE")) return "bg-rose-900/40 text-rose-300 border-rose-700/50";
    return "bg-slate-700 text-slate-300 border-slate-600";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Banner & Metadata Info */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Expense Tracker Backend</h1>
              <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-700">v1.0.0</span>
            </div>
            <p className="text-xs text-slate-400">Spring Boot 3 • Java 21 • Clean Layered Architecture</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* UTC Status Indicator */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Time:</span>
            <span className="text-emerald-400">2026-07-01 10:48:00 UTC</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1.5 rounded-full border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
            COMPILATION SUCCESS
          </div>
        </div>
      </header>

      {/* Main Layout Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: Navigation Controls and Info Panels */}
        <section className="w-full lg:w-80 border-r border-slate-800 bg-slate-900/40 p-5 flex flex-col gap-5 shrink-0">
          
          {/* Main Navigation Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("explorer")}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === "explorer"
                  ? "bg-slate-800 text-white shadow-md border-t border-slate-700/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-emerald-400" />
              Code Source
            </button>
            <button
              onClick={() => setActiveTab("swagger")}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === "swagger"
                  ? "bg-slate-800 text-white shadow-md border-t border-slate-700/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              API Playground
            </button>
          </div>

          {/* Quick Stats Panel representing the State of our simulated database */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-800/60 pb-2">
              <span className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-cyan-400" />
                Base PostgreSQL (Simulée)
              </span>
              <span className="text-emerald-400">En ligne</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500">Categories</p>
                <p className="text-sm font-bold text-slate-200">{categories.length}</p>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500">Dépenses</p>
                <p className="text-sm font-bold text-slate-200">{expenses.length}</p>
              </div>
            </div>

            {/* Current Month Budget Status Panel */}
            <div className="mt-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">Budget Juillet 2026:</span>
                <span className="font-mono text-emerald-400 font-bold">{monthlyBudget.amount.toFixed(2)} €</span>
              </div>
              
              {/* Progress bar */}
              {(() => {
                const totalMonth = expenses
                  .filter(e => e.expenseDate.startsWith("2026-07"))
                  .reduce((sum, e) => sum + e.amount, 0);
                const pct = monthlyBudget.amount > 0 ? (totalMonth / monthlyBudget.amount) * 100 : 0;
                const exceeded = totalMonth > monthlyBudget.amount;
                return (
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${exceeded ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span>Dépensé: {totalMonth.toFixed(2)} €</span>
                      <span className={exceeded ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Export / DevOps Section */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-amber-400" />
              DevOps & Exportation
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Le code source complet a été généré physiquement dans le dossier <code className="bg-slate-900 text-amber-400 font-mono px-1 rounded border border-slate-800 text-[10px]">/backend</code>.
            </p>
            <div className="mt-1 flex flex-col gap-1.5 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded border border-slate-800">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Dockerfile inclus</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded border border-slate-800">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>Docker-compose prêt</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Utilisez le menu <b className="text-slate-300">Settings</b> d'AI Studio pour exporter le projet sous forme de **ZIP** ou directement sur **GitHub**.
            </p>
          </div>
          
        </section>

        {/* Right Side / Workspace viewport */}
        <section className="flex-1 bg-slate-950 flex flex-col overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* TAB: CODE SOURCE EXPLORER */}
            {activeTab === "explorer" && (
              <motion.div 
                key="explorer-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col md:flex-row overflow-hidden"
              >
                
                {/* Visual Package Tree sidebar */}
                <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800/60 bg-slate-900/20 overflow-y-auto p-4 shrink-0 max-h-72 md:max-h-none">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Structure Maven</div>
                  
                  {/* Embedded File Tree Navigation */}
                  <div className="space-y-1">
                    
                    {/* Root node /backend */}
                    <div>
                      <button 
                        onClick={() => toggleFolder("backend")}
                        className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white hover:bg-slate-900 py-1.5 px-2 rounded-lg transition-colors"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Folder className="w-4 h-4 text-emerald-400 fill-emerald-400/10" />
                          backend
                        </span>
                        {expandedFolders["backend"] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                      
                      {expandedFolders["backend"] && (
                        <div className="ml-4 border-l border-slate-800 pl-2 mt-1 space-y-1">
                          
                          {/* POM.xml */}
                          <button 
                            onClick={() => setSelectedFilePath("/backend/pom.xml")}
                            className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/pom.xml" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                          >
                            <File className="w-3.5 h-3.5 text-cyan-400" />
                            pom.xml
                          </button>

                          {/* Dockerfile */}
                          <button 
                            onClick={() => setSelectedFilePath("/backend/Dockerfile")}
                            className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/Dockerfile" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                          >
                            <File className="w-3.5 h-3.5 text-blue-400" />
                            Dockerfile
                          </button>

                          {/* Docker-compose.yml */}
                          <button 
                            onClick={() => setSelectedFilePath("/backend/docker-compose.yml")}
                            className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/docker-compose.yml" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                          >
                            <File className="w-3.5 h-3.5 text-blue-400" />
                            docker-compose.yml
                          </button>

                          {/* README */}
                          <button 
                            onClick={() => setSelectedFilePath("/backend/README.md")}
                            className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/README.md" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                          >
                            <File className="w-3.5 h-3.5 text-emerald-400" />
                            README.md
                          </button>

                          {/* Resources folder */}
                          <div>
                            <button 
                              onClick={() => toggleFolder("backend/src/main/resources")}
                              className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white hover:bg-slate-900 py-1.5 px-2 rounded-lg"
                            >
                              <span className="flex items-center gap-2 font-medium">
                                <Folder className="w-4 h-4 text-emerald-400/80 fill-emerald-400/5" />
                                resources
                              </span>
                              {expandedFolders["backend/src/main/resources"] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                            {expandedFolders["backend/src/main/resources"] && (
                              <div className="ml-4 border-l border-slate-800 pl-2 mt-1 space-y-1">
                                <button 
                                  onClick={() => setSelectedFilePath("/backend/src/main/resources/application.yml")}
                                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/src/main/resources/application.yml" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                                >
                                  <File className="w-3.5 h-3.5 text-amber-500" />
                                  application.yml
                                </button>
                              </div>
                            )}
                          </div>

                          {/* java packages */}
                          <div>
                            <button 
                              onClick={() => toggleFolder("backend/src/main/java/com/expensetracker")}
                              className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white hover:bg-slate-900 py-1.5 px-2 rounded-lg"
                            >
                              <span className="flex items-center gap-2 font-medium">
                                <Folder className="w-4 h-4 text-emerald-400/80 fill-emerald-400/5" />
                                com.expensetracker
                              </span>
                              {expandedFolders["backend/src/main/java/com/expensetracker"] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                            
                            {expandedFolders["backend/src/main/java/com/expensetracker"] && (
                              <div className="ml-4 border-l border-slate-800 pl-2 mt-1 space-y-1">
                                
                                {/* main Application entry point */}
                                <button 
                                  onClick={() => setSelectedFilePath("/backend/src/main/java/com/expensetracker/ExpenseTrackerApplication.java")}
                                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/src/main/java/com/expensetracker/ExpenseTrackerApplication.java" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                                >
                                  <File className="w-3.5 h-3.5 text-emerald-400" />
                                  ExpenseTrackerApplication.java
                                </button>

                                {/* config */}
                                <button 
                                  onClick={() => setSelectedFilePath("/backend/src/main/java/com/expensetracker/config/SwaggerConfig.java")}
                                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/src/main/java/com/expensetracker/config/SwaggerConfig.java" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                                >
                                  <File className="w-3.5 h-3.5 text-amber-400" />
                                  config/SwaggerConfig.java
                                </button>

                                {/* security */}
                                <button 
                                  onClick={() => setSelectedFilePath("/backend/src/main/java/com/expensetracker/security/config/WebSecurityConfig.java")}
                                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/src/main/java/com/expensetracker/security/config/WebSecurityConfig.java" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                                >
                                  <File className="w-3.5 h-3.5 text-amber-400" />
                                  security/WebSecurityConfig.java
                                </button>

                                {/* jwt */}
                                <button 
                                  onClick={() => setSelectedFilePath("/backend/src/main/java/com/expensetracker/security/jwt/JwtUtils.java")}
                                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/src/main/java/com/expensetracker/security/jwt/JwtUtils.java" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                                >
                                  <File className="w-3.5 h-3.5 text-amber-400" />
                                  security/jwt/JwtUtils.java
                                </button>

                                {/* entities package */}
                                <div>
                                  <button 
                                    onClick={() => toggleFolder("backend/src/main/java/com/expensetracker/entity")}
                                    className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-white hover:bg-slate-900 py-1.5 px-2 rounded-lg"
                                  >
                                    <span className="flex items-center gap-2">
                                      <Folder className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/10" />
                                      entity
                                    </span>
                                    {expandedFolders["backend/src/main/java/com/expensetracker/entity"] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                  </button>
                                  {expandedFolders["backend/src/main/java/com/expensetracker/entity"] && (
                                    <div className="ml-4 border-l border-slate-800/80 pl-2 mt-0.5 space-y-0.5">
                                      {["User", "Expense", "Category", "MonthlyBudget"].map(ent => (
                                        <button 
                                          key={ent}
                                          onClick={() => setSelectedFilePath(`/backend/src/main/java/com/expensetracker/entity/${ent}.java`)}
                                          className={`w-full text-left text-[11px] py-1 px-2 rounded flex items-center gap-2 transition-colors ${selectedFilePath === `/backend/src/main/java/com/expensetracker/entity/${ent}.java` ? "bg-yellow-500/10 text-yellow-300 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                                        >
                                          <File className="w-3 h-3 text-yellow-500" />
                                          {ent}.java
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* controller package */}
                                <div>
                                  <button 
                                    onClick={() => toggleFolder("backend/src/main/java/com/expensetracker/controller")}
                                    className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-white hover:bg-slate-900 py-1.5 px-2 rounded-lg"
                                  >
                                    <span className="flex items-center gap-2">
                                      <Folder className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                                      controller
                                    </span>
                                    {expandedFolders["backend/src/main/java/com/expensetracker/controller"] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                  </button>
                                  {expandedFolders["backend/src/main/java/com/expensetracker/controller"] && (
                                    <div className="ml-4 border-l border-slate-800/80 pl-2 mt-0.5 space-y-0.5">
                                      {["AuthController", "CategoryController", "ExpenseController", "BudgetController", "DashboardController"].map(ctrl => (
                                        <button 
                                          key={ctrl}
                                          onClick={() => setSelectedFilePath(`/backend/src/main/java/com/expensetracker/controller/${ctrl}.java`)}
                                          className={`w-full text-left text-[11px] py-1 px-2 rounded flex items-center gap-2 transition-colors ${selectedFilePath === `/backend/src/main/java/com/expensetracker/controller/${ctrl}.java` ? "bg-blue-500/10 text-blue-300 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                                        >
                                          <File className="w-3 h-3 text-blue-500" />
                                          {ctrl}.java
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* service impl */}
                                <button 
                                  onClick={() => setSelectedFilePath("/backend/src/main/java/com/expensetracker/service/impl/ExpenseServiceImpl.java")}
                                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/src/main/java/com/expensetracker/service/impl/ExpenseServiceImpl.java" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                                >
                                  <File className="w-3.5 h-3.5 text-emerald-400" />
                                  service/impl/ExpenseServiceImpl.java
                                </button>

                                {/* mapper */}
                                <button 
                                  onClick={() => setSelectedFilePath("/backend/src/main/java/com/expensetracker/mapper/ExpenseMapper.java")}
                                  className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center gap-2 transition-colors ${selectedFilePath === "/backend/src/main/java/com/expensetracker/mapper/ExpenseMapper.java" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium" : "text-slate-400 hover:text-white hover:bg-slate-900"}`}
                                >
                                  <File className="w-3.5 h-3.5 text-pink-400" />
                                  mapper/ExpenseMapper.java
                                </button>

                              </div>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Code Editor Viewport */}
                <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden border-t md:border-t-0 border-slate-800">
                  
                  {/* Editor Tab bar */}
                  <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/80 py-1 px-2 rounded border border-slate-800">
                      <Code className="w-3.5 h-3.5 text-emerald-400" />
                      {selectedFilePath}
                    </div>
                    <button 
                      onClick={() => handleCopyCode(getFileContent(selectedFilePath))}
                      className="text-xs bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded border border-slate-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedFile ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Code rendering viewport */}
                  <div className="flex-1 overflow-auto p-5 font-mono text-[11px] md:text-xs leading-relaxed text-slate-300 select-text bg-slate-950/40">
                    <pre className="whitespace-pre">
                      {highlightJavaCode(getFileContent(selectedFilePath))}
                    </pre>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB: SWAGGER INTERACTIVE PLAYGROUND */}
            {activeTab === "swagger" && (
              <motion.div 
                key="swagger-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Swagger Instructions Banner */}
                <div className="bg-blue-950/30 border-b border-blue-900/30 px-6 py-3.5 flex items-start gap-3">
                  <div className="bg-blue-500/10 p-1.5 rounded text-blue-400 border border-blue-500/20 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-blue-300 leading-relaxed">
                    <span className="font-bold text-white">Console Swagger Interactive :</span> Testez les endpoints REST du backend Expense Tracker en direct. Les données saisies sont persistées dans la session client de votre navigateur. Commencez par **S'enregistrer** et **S'authentifier** (Login) pour débloquer le JWT Token d'accès sécurisé !
                  </div>
                </div>

                {/* Playground Control Pane */}
                <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                  
                  {/* Left Parameter Panel */}
                  <div className="w-full xl:w-[450px] border-b xl:border-b-0 xl:border-r border-slate-800 bg-slate-900/10 p-5 overflow-y-auto flex flex-col gap-4">
                    
                    {/* Endpoint Selector Group */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sélectionner un Endpoint REST</label>
                      <select 
                        value={selectedEndpoint}
                        onChange={(e) => setSelectedEndpoint(e.target.value)}
                        className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
                      >
                        <optgroup label="AUTHENTIFICATION (PUBLIC)">
                          <option value="POST /auth/register">POST /api/auth/register (Inscription)</option>
                          <option value="POST /auth/login">POST /api/auth/login (Connexion)</option>
                        </optgroup>
                        <optgroup label="CATEGORIES (SECURED)">
                          <option value="GET /categories">GET /api/categories (Toutes les catégories)</option>
                          <option value="POST /categories">POST /api/categories (Créer catégorie)</option>
                        </optgroup>
                        <optgroup label="DEPENSES - EXPENSES (SECURED)">
                          <option value="GET /expenses">GET /api/expenses (Toutes les dépenses)</option>
                          <option value="POST /expenses">POST /api/expenses (Créer dépense)</option>
                          <option value="GET /expenses/filter">GET /api/expenses/filter (Filtrer les dépenses)</option>
                        </optgroup>
                        <optgroup label="BUDGET MENSUEL (SECURED)">
                          <option value="GET /budget">GET /api/budget (Consulter budget)</option>
                          <option value="POST /budget">POST /api/budget (Définir budget)</option>
                          <option value="PUT /budget">PUT /api/budget (Modifier budget)</option>
                        </optgroup>
                        <optgroup label="TABLEAU DE BORD (SECURED)">
                          <option value="GET /dashboard">GET /api/dashboard (Vue synthétique)</option>
                          <option value="GET /dashboard/statistics">GET /api/dashboard/statistics (Statistiques)</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Authentication Status Badge inside Swagger */}
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Statut de connexion:</span>
                      {authToken ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>JWT ACTIF</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-400 font-semibold bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/20 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>NON CONNECTÉ</span>
                        </div>
                      )}
                    </div>

                    {/* Active JWT token visual indicator */}
                    {authToken && (
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1 text-[10px] font-mono">
                        <span className="text-slate-500 font-bold uppercase tracking-wider">Authorization Header</span>
                        <div className="text-slate-300 break-all bg-slate-900/60 p-2 rounded border border-slate-800 text-[9px] text-blue-300">
                          Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIi...
                        </div>
                      </div>
                    )}

                    {/* Request Body Area */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Corps de la requête (JSON Body)</label>
                        {reqBody && <span className="text-[9px] font-mono text-emerald-400">editable</span>}
                      </div>
                      
                      {reqBody ? (
                        <textarea
                          value={reqBody}
                          onChange={(e) => setReqBody(e.target.value)}
                          disabled={selectedEndpoint.startsWith("GET") && !selectedEndpoint.includes("filter")}
                          className="flex-1 min-h-[160px] bg-slate-950 border border-slate-700/80 rounded-lg p-3.5 font-mono text-xs text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 leading-relaxed resize-y"
                        />
                      ) : (
                        <div className="flex-1 min-h-[160px] bg-slate-950/40 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-500 text-xs gap-1">
                          <Info className="w-5 h-5 text-slate-600" />
                          <span>Aucun corps requis pour cet endpoint</span>
                        </div>
                      )}
                    </div>

                    {/* Send request action button */}
                    <button
                      onClick={executeApiCall}
                      disabled={isLoadingApi}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.15)] active:scale-[0.98] cursor-pointer"
                    >
                      {isLoadingApi ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Simulateur actif...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Envoyer la requête</span>
                        </>
                      )}
                    </button>

                  </div>

                  {/* Right Response Panel */}
                  <div className="flex-1 flex flex-col bg-slate-950 p-5 overflow-hidden">
                    
                    {/* Header showing HTTP status */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Réponse HTTP Standardisée</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Status code badge */}
                        <span className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                          apiSuccess 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}>
                          {apiStatus}
                        </span>
                      </div>
                    </div>

                    {/* Formatted JSON Output */}
                    <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-xl p-5 overflow-auto font-mono text-xs text-slate-300">
                      <pre className="whitespace-pre">
                        {highlightJson(apiResponse)}
                      </pre>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </section>

      </main>

    </div>
  );
}

// Simple JSON Syntax Highlighter for presentation
function highlightJson(json: string): React.ReactNode[] {
  const lines = json.split("\n");
  return lines.map((line, idx) => {
    let element: React.ReactNode = line;

    // Highlight keys
    if (line.includes('":')) {
      const parts = line.split('":');
      const key = parts[0];
      const val = parts.slice(1).join('":');
      
      element = (
        <span key={idx}>
          <span className="text-purple-400">{key}"</span>
          <span className="text-slate-400">:</span>
          {highlightValue(val)}
        </span>
      );
    } else {
      element = <span key={idx} className="text-slate-400">{line}</span>;
    }

    return (
      <div key={idx} className="min-h-[1.2rem]">
        {element}
      </div>
    );
  });
}

function highlightValue(val: string): React.ReactNode {
  const trimmed = val.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('",')) {
    return <><span className="text-emerald-400"> {trimmed.slice(0, -1)}</span><span className="text-slate-400">,</span></>;
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return <span className="text-emerald-400"> {trimmed}</span>;
  }
  if (trimmed === "true," || trimmed === "false,") {
    return <><span className="text-amber-500"> {trimmed.slice(0, -1)}</span><span className="text-slate-400">,</span></>;
  }
  if (trimmed === "true" || trimmed === "false") {
    return <span className="text-amber-500"> {trimmed}</span>;
  }
  if (!isNaN(parseFloat(trimmed))) {
    return <span className="text-cyan-400"> {trimmed}</span>;
  }
  return <span className="text-slate-300"> {val}</span>;
}

// Custom simple Java / XML Syntax Highlighter for visual code editor
function highlightJavaCode(code: string): React.ReactNode {
  const lines = code.split("\n");
  
  return lines.map((line, idx) => {
    // Basic formatting
    let content: React.ReactNode = line;
    
    // Check if XML/POM
    if (line.trim().startsWith("<") || line.trim().startsWith("<?")) {
      // Highlight XML tags
      const tagRegex = /(<\/?[a-zA-Z0-9:-]+>)/g;
      const parts = line.split(tagRegex);
      content = parts.map((part, pIdx) => {
        if (part.startsWith("<")) {
          return <span key={pIdx} className="text-blue-400">{part}</span>;
        }
        return <span key={pIdx} className="text-slate-300">{part}</span>;
      });
    } else if (line.trim().startsWith("#")) {
      // Yaml comment
      content = <span className="text-slate-500">{line}</span>;
    } else if (line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*")) {
      // Java comments
      content = <span className="text-slate-500 italic">{line}</span>;
    } else {
      // Java keywords
      const keywords = ["package ", "import ", "public ", "private ", "class ", "interface ", "enum ", "extends ", "implements ", "return ", "new ", "void ", "double ", "int ", "long ", "boolean ", "protected ", "throw ", "throws "];
      const annotations = ["@SpringBootApplication", "@Entity", "@Table", "@Id", "@GeneratedValue", "@Column", "@ManyToOne", "@OneToMany", "@JoinColumn", "@Getter", "@Setter", "@NoArgsConstructor", "@AllArgsConstructor", "@Builder", "@PrePersist", "@PreUpdate", "@Repository", "@Service", "@Autowired", "@RestController", "@RequestMapping", "@Tag", "@Operation", "@PostMapping", "@GetMapping", "@PutMapping", "@DeleteMapping", "@Valid", "@RequestBody", "@PathVariable", "@RequestParam", "@Configuration", "@EnableWebSecurity", "@EnableMethodSecurity", "@Bean", "@Value"];
      
      let matchedKeyword = keywords.find(k => line.includes(k));
      let matchedAnnotation = annotations.find(a => line.includes(a));
      
      if (matchedKeyword || matchedAnnotation) {
        // Just highlight simple parts
        const words = line.split(" ");
        content = words.map((word, wIdx) => {
          let space = wIdx < words.length - 1 ? " " : "";
          if (keywords.includes(word + " ") || keywords.includes(word)) {
            return <span key={wIdx} className="text-purple-400 font-bold">{word}{space}</span>;
          }
          if (word.startsWith("@")) {
            return <span key={wIdx} className="text-amber-400">{word}{space}</span>;
          }
          return <span key={wIdx}>{word}{space}</span>;
        });
      }
    }

    return (
      <div key={idx} className="flex hover:bg-slate-900/50 py-0.5 px-2 rounded transition-colors min-h-[1.2rem]">
        <span className="w-10 text-slate-600 select-none border-r border-slate-800 pr-3 mr-3 text-right text-[10px]">{idx + 1}</span>
        <span className="flex-1 whitespace-pre">{content}</span>
      </div>
    );
  });
}

// Dictionary containing our key Spring Boot source files
function getFileContent(filePath: string): string {
  switch (filePath) {
    case "/backend/pom.xml":
      return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.1</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <groupId>com.expensetracker</groupId>
    <artifactId>expense-tracker-backend</artifactId>
    <version>1.0.0</version>
    <name>expense-tracker-backend</name>
    <description>Backend of a personal Expense Tracker application using Spring Boot 3 and Java 21</description>

    <properties>
        <java.version>21</java.version>
        <org.mapstruct.version>1.5.5.Final</org.mapstruct.version>
        <org.projectlombok.version>1.18.32</org.projectlombok.version>
        <lombok-mapstruct-binding.version>0.2.0</lombok-mapstruct-binding.version>
        <jjwt.version>0.11.5</jjwt.version>
        <springdoc.version>2.5.0</springdoc.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Database -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>\${org.projectlombok.version}</version>
            <scope>provided</scope>
        </dependency>

        <!-- MapStruct -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>\${org.mapstruct.version}</version>
        </dependency>

        <!-- Swagger OpenAPI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>\${springdoc.version}</version>
        </dependency>

        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
    </dependencies>
</project>`;

    case "/backend/Dockerfile":
      return `# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`;

    case "/backend/docker-compose.yml":
      return `version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: expense-tracker-db
    restart: always
    environment:
      POSTGRES_DB: expensetracker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: .
    container_name: expense-tracker-backend
    restart: always
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=expensetracker
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
    depends_on:
      - db

volumes:
  pgdata:`;

    case "/backend/src/main/resources/application.yml":
      return `server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: expense-tracker-backend

  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:\${DB_PORT:5432}/\${DB_NAME:expensetracker}
    username: \${DB_USERNAME:postgres}
    password: \${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

app:
  jwt:
    secret: 9a4f2c8d3e1b7f0a5c6d2e8b9f1a0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9
    expirationMs: 86400000`;

    case "/backend/src/main/java/com/expensetracker/ExpenseTrackerApplication.java":
      return `package com.expensetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ExpenseTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseTrackerApplication.class, args);
    }
}`;

    case "/backend/src/main/java/com/expensetracker/config/SwaggerConfig.java":
      return `package com.expensetracker.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Expense Tracker REST API")
                        .version("1.0.0")
                        .description("Professional REST API Backend for a Personal Expense Tracker Application."))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}`;

    case "/backend/src/main/java/com/expensetracker/security/config/WebSecurityConfig.java":
      return `package com.expensetracker.security.config;

import com.expensetracker.security.jwt.AuthEntryPointJwt;
import com.expensetracker.security.jwt.AuthTokenFilter;
import com.expensetracker.security.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth ->
                auth.requestMatchers("/auth/**").permitAll()
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()
                    .anyRequest().authenticated()
            );

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}`;

    case "/backend/src/main/java/com/expensetracker/security/jwt/JwtUtils.java":
      return `package com.expensetracker.security.jwt;

import com.expensetracker.security.service.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("\${app.jwt.secret}")
    private String jwtSecret;

    @Value("\${app.jwt.expirationMs}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getEmail()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }
}`;

    case "/backend/src/main/java/com/expensetracker/entity/User.java":
      return `package com.expensetracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstname;

    @Column(nullable = false)
    private String lastname;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Category> categories;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Expense> expenses;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<MonthlyBudget> monthlyBudgets;
}`;

    case "/backend/src/main/java/com/expensetracker/entity/Expense.java":
      return `package com.expensetracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDate expenseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}`;

    case "/backend/src/main/java/com/expensetracker/entity/Category.java":
      return `package com.expensetracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String color;
    private String icon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}`;

    case "/backend/src/main/java/com/expensetracker/entity/MonthlyBudget.java":
      return `package com.expensetracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_budgets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MonthlyBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private Integer month;
    private Integer year;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}`;

    case "/backend/src/main/java/com/expensetracker/service/impl/ExpenseServiceImpl.java":
      return `package com.expensetracker.service.impl;

import com.expensetracker.dto.request.ExpenseRequest;
import com.expensetracker.dto.response.ExpenseResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.mapper.ExpenseMapper;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.service.interfaces.ExpenseService;
import com.expensetracker.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseMapper expenseMapper;

    @Autowired
    private SecurityUtils securityUtils;

    @Override
    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        User currentUser = securityUtils.getCurrentUser();

        Category category = categoryRepository.findByIdAndUser(request.getCategoryId(), currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + request.getCategoryId()));

        Expense expense = expenseMapper.toEntity(request);
        expense.setCategory(category);
        expense.setUser(currentUser);

        Expense savedExpense = expenseRepository.save(expense);
        return expenseMapper.toResponse(savedExpense);
    }

    @Override
    public List<ExpenseResponse> filterExpenses(Long categoryId, LocalDate startDate, LocalDate endDate, Double minAmount, Double maxAmount) {
        User currentUser = securityUtils.getCurrentUser();
        List<Expense> expenses = expenseRepository.filterExpenses(currentUser, categoryId, startDate, endDate, minAmount, maxAmount);
        return expenseMapper.toResponseList(expenses);
    }
}`;

    case "/backend/src/main/java/com/expensetracker/mapper/ExpenseMapper.java":
      return `package com.expensetracker.mapper;

import com.expensetracker.dto.request.ExpenseRequest;
import com.expensetracker.dto.response.ExpenseResponse;
import com.expensetracker.entity.Expense;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class})
public interface ExpenseMapper {

    ExpenseResponse toResponse(Expense expense);

    List<ExpenseResponse> toResponseList(List<Expense> expenses);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Expense toEntity(ExpenseRequest request);
}`;

    case "/backend/src/main/java/com/expensetracker/controller/AuthController.java":
      return `package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.request.LoginRequest;
import com.expensetracker.dto.request.RegisterRequest;
import com.expensetracker.dto.response.AuthResponse;
import com.expensetracker.dto.response.UserResponse;
import com.expensetracker.service.interfaces.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Endpoints for registration and login")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return new ResponseEntity<>(ApiResponse.success("User registered successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and issue JWT Token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }
}`;

    case "/backend/src/main/java/com/expensetracker/controller/CategoryController.java":
      return `package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.request.CategoryRequest;
import com.expensetracker.dto.response.CategoryResponse;
import com.expensetracker.service.interfaces.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/categories")
@Tag(name = "Category Management")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all personal categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categoryService.getAllCategories()));
    }

    @PostMapping
    @Operation(summary = "Create a custom category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", categoryService.createCategory(request)));
    }
}`;

    case "/backend/src/main/java/com/expensetracker/controller/ExpenseController.java":
      return `package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.request.ExpenseRequest;
import com.expensetracker.dto.response.ExpenseResponse;
import com.expensetracker.service.interfaces.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/expenses")
@Tag(name = "Expense Management")
@SecurityRequirement(name = "bearerAuth")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping
    @Operation(summary = "Get user expenses list")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getAllExpenses() {
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved", expenseService.getAllExpenses()));
    }

    @PostMapping
    @Operation(summary = "Record a new expense item")
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(@Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Expense logged", expenseService.createExpense(request)));
    }
}`;

    case "/backend/src/main/java/com/expensetracker/controller/BudgetController.java":
      return `package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.request.BudgetRequest;
import com.expensetracker.dto.response.BudgetResponse;
import com.expensetracker.dto.response.BudgetStatusResponse;
import com.expensetracker.service.interfaces.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/budget")
@Tag(name = "Budget Management")
@SecurityRequirement(name = "bearerAuth")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Get monthly budget parameters with consumption alerts")
    public ResponseEntity<ApiResponse<BudgetStatusResponse>> getBudgetStatus(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(ApiResponse.success("Budget status loaded", budgetService.getBudgetStatus(month, year)));
    }

    @PostMapping
    @Operation(summary = "Setup monthly budget limits")
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Budget defined", budgetService.createOrUpdateBudget(request)));
    }
}`;

    case "/backend/src/main/java/com/expensetracker/controller/DashboardController.java":
      return `package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.response.DashboardStatsResponse;
import com.expensetracker.service.interfaces.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard Statistics")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Retrieve transaction metrics and trends")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved", dashboardService.getDashboardStatistics()));
    }
}`;

    case "/backend/README.md":
    default:
      return `# 💰 Expense Tracker Backend - Spring Boot 3 & Java 21

Ce projet est le backend professionnel d'une application de gestion des dépenses personnelles (**Expense Tracker**). Conçu en suivant les bonnes pratiques **SOLID** et une architecture en couches propre.

## 🚀 Fonctionnalités Clés
*   **Sécurité et Authentification** : Système d'inscription et de connexion JWT. Hachage des mots de passe BCrypt.
*   **Catégories** : CRUD Complet et isolation totale par utilisateur.
*   **Dépenses (Expenses)** : CRUD Complet avec filtres avancés (dates, catégorie, montant).
*   **Budgets Mensuels & Alertes** : Alerte de dépassement de budget (\`warning=true\`).
*   **Tableau de Bord** : KPI agrégés, répartition catégorielle et historique de tendance mensuelle.

## 🐳 Déploiement Docker
\`\`\`bash
cd backend
docker-compose up --build
\`\`\`

## 📚 Swagger OpenAPI Docs
*   **Swagger UI** : \`http://localhost:8080/api/swagger-ui.html\`
*   **JSON OpenAPI** : \`http://localhost:8080/api/v3/api-docs\``;
  }
}
