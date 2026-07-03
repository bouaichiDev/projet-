import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { AuthService } from "../services/AuthService";
import { getApiMode, setApiMode as saveApiMode } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  apiMode: "real" | "demo";
  setApiMode: (mode: "real" | "demo") => void;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiMode, setApiModeState] = useState<"real" | "demo">(getApiMode());

  useEffect(() => {
    // Check if token and user exist in local storage on boot
    const storedToken = localStorage.getItem("token");
    const storedUser = AuthService.getCurrentUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);

    // Listen for changes to API mode in other parts of the app
    const handleModeChange = () => {
      setApiModeState(getApiMode());
      // Refresh user context based on new mode
      const updatedUser = AuthService.getCurrentUser();
      setUser(updatedUser);
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("api_mode_changed", handleModeChange);
    return () => {
      window.removeEventListener("api_mode_changed", handleModeChange);
    };
  }, []);

  const changeApiMode = (mode: "real" | "demo") => {
    saveApiMode(mode);
    setApiModeState(mode);
    
    // Auto logout on mode switch to ensure correct context
    AuthService.logout();
    setUser(null);
    setToken(null);
  };

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const result = await AuthService.login(credentials);
      setToken(result.token);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const newUser = await AuthService.register(userData);
      // Automatically log them in in Demo Mode
      if (apiMode === "demo") {
        await login({ email: userData.email, password: userData.password });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (updatedUser: User) => {
    const result = await AuthService.updateProfile(updatedUser);
    setUser(result);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        apiMode,
        setApiMode: changeApiMode,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
