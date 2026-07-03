import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  Bell, 
  Search, 
  ChevronDown, 
  User as UserIcon, 
  LogOut, 
  Database, 
  Sparkles,
  Info
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, apiMode, setApiMode, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Dynamic Page Title mapping
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Tableau de bord";
      case "/depenses":
        return "Dépenses";
      case "/categories":
        return "Catégories";
      case "/budget":
        return "Budget mensuel";
      case "/statistiques":
        return "Statistiques";
      case "/profil":
        return "Mon Profil";
      default:
        return "Gestion de Dépenses";
    }
  };

  const getPageDescription = () => {
    switch (location.pathname) {
      case "/":
        return "Aperçu de vos finances personnelles en temps réel.";
      case "/depenses":
        return "Consultez, ajoutez et gérez vos transactions.";
      case "/categories":
        return "Organisez vos dépenses par dossiers thématiques.";
      case "/budget":
        return "Planifiez vos limites mensuelles et suivez vos objectifs.";
      case "/statistiques":
        return "Analysez la répartition et l'évolution de vos coûts.";
      case "/profil":
        return "Configurez vos informations et vos identifiants.";
      default:
        return "";
    }
  };

  const toggleApiMode = () => {
    const nextMode = apiMode === "demo" ? "real" : "demo";
    setApiMode(nextMode);
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Mock Notifications
  const notifications = [
    { id: 1, text: "Bienvenue sur votre gestionnaire de dépenses !", time: "À l'instant", read: false },
    { id: 2, text: "Alerte : Vous avez atteint 80% de votre budget Logement.", time: "Hier", read: true },
    { id: 3, text: "Dépense de 124.50€ ajoutée avec succès.", time: "Il y a 2 jours", read: true }
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between select-none">
      {/* Left side: Hamburger (mobile) & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="font-display text-lg font-bold text-[#1E293B] leading-none">
            {getPageTitle()}
          </h1>
          <p className="text-[10px] text-slate-400 font-medium mt-1 hidden sm:block">
            {getPageDescription()}
          </p>
        </div>
      </div>

      {/* Right side: Search, Mode Switch, Notifications, Avatar */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* API Mode Toggle button */}
        <button
          onClick={toggleApiMode}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs border transition-all duration-300
            ${apiMode === "demo"
              ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:scale-[1.02]"
              : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:scale-[1.02]"
            }
          `}
          title={`Actuellement en Mode ${apiMode === "demo" ? "Démo" : "API Real"}. Cliquez pour changer.`}
        >
          {apiMode === "demo" ? (
            <>
              <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10 animate-pulse" />
              <span className="hidden md:inline">Mode Démo</span>
            </>
          ) : (
            <>
              <Database className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span className="hidden md:inline">Mode API Spring</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowProfileDropdown(false);
            }}
            className="p-2 text-slate-500 hover:text-[#1E293B] hover:bg-slate-50 rounded-xl transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">3 Nouvelles</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className="px-4 py-3 hover:bg-slate-50/50 transition-colors flex flex-col gap-1">
                    <p className={`text-xs ${notif.read ? "text-slate-500" : "text-slate-800 font-medium"}`}>
                      {notif.text}
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium">{notif.time}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pt-2 border-t border-slate-50 text-center">
                <button className="text-[10px] text-blue-600 font-bold hover:underline">Marquer tout comme lu</button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Area */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="h-9 w-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                {(user.firstname?.[0] ?? "")}{(user.lastname?.[0] ?? "")}
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2.5 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-50">
                  <p className="text-xs font-semibold text-slate-800">{user.firstname} {user.lastname}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate("/profil");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 text-left transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  Mon Profil
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 text-left transition-colors"
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
