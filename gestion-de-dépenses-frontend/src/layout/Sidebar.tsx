import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  FolderOpen, 
  PiggyBank, 
  BarChart3, 
  User, 
  LogOut,
  Sparkles,
  Database,
  Globe
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user, apiMode } = useAuth();

  const menuItems = [
    {
      label: "Tableau de bord",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      label: "Dépenses",
      path: "/depenses",
      icon: <Receipt className="h-5 w-5" />
    },
    {
      label: "Catégories",
      path: "/categories",
      icon: <FolderOpen className="h-5 w-5" />
    },
    {
      label: "Budget mensuel",
      path: "/budget",
      icon: <PiggyBank className="h-5 w-5" />
    },
    {
      label: "Statistiques",
      path: "/statistiques",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      label: "Profil",
      path: "/profil",
      icon: <User className="h-5 w-5" />
    }
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Sidebar Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Top Header Logo */}
        <div className="flex flex-col gap-1 px-6 py-6 border-b border-slate-50 select-none">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              €
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-[#1E293B] text-sm tracking-tight leading-none">
                Gestion de Dépenses
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
                Portefeuille Personnel
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 select-none
                ${isActive
                  ? "bg-blue-50 text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-[#1E293B] hover:bg-slate-50"
                }
              `}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-50 space-y-3.5">
          {/* Active Mode Status Badge */}
          <div className={`p-3 rounded-xl flex flex-col gap-1 transition-all duration-200 select-none
            ${apiMode === "demo" 
              ? "bg-amber-50/50 border border-amber-100/50 text-amber-800" 
              : "bg-emerald-50/50 border border-emerald-100/50 text-emerald-800"
            }
          `}>
            <div className="flex items-center gap-1.5">
              {apiMode === "demo" ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-bold">Mode Démo Intégré</span>
                </>
              ) : (
                <>
                  <Database className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-bold">Mode API Spring Boot</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              {apiMode === "demo" 
                ? "Données locales. Idéal pour présenter sans serveur." 
                : "Connecté à http://localhost:8080/api."
              }
            </p>
          </div>

          {/* Connected User Badge */}
          {user && (
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="h-9 w-9 bg-slate-100 border border-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-bold text-sm">
                {user.firstname[0]}{user.lastname[0]}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#1E293B] truncate">
                  {user.firstname} {user.lastname}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150 text-left select-none"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};
