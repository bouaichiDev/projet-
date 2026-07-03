import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Lock, Sparkles, Database, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card, CardContent } from "../components/Card";

export const Connexion: React.FC = () => {
  const { login, apiMode, setApiMode } = useAuth();
  const navigate = useNavigate();
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: apiMode === "demo" ? "lucas.martin@univ-paris.fr" : "",
      password: apiMode === "demo" ? "password123" : ""
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Une erreur est survenue lors de la connexion. Vérifiez vos identifiants ou le statut du serveur."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeToggle = (mode: "real" | "demo") => {
    setApiMode(mode);
    if (mode === "demo") {
      setValue("email", "lucas.martin@univ-paris.fr");
      setValue("password", "password123");
    } else {
      setValue("email", "");
      setValue("password", "");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12 select-none font-sans">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-[#2563EB] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md mb-3">
            €
          </div>
          <h2 className="font-display text-xl font-bold text-[#1E293B]">
            Gestion de dépenses personnelles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Projet Universitaire de fin d'année - Portail d'accès
          </p>
        </div>

        {/* Connection Card */}
        <Card className="border border-slate-100 shadow-xl bg-white rounded-2xl overflow-hidden">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-50 bg-slate-50/50 p-1">
            <button
              onClick={() => handleModeToggle("demo")}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all
                ${apiMode === "demo"
                  ? "bg-white text-amber-600 shadow-sm border border-amber-100/30"
                  : "text-slate-400 hover:text-slate-600"
                }
              `}
            >
              <Sparkles className={`h-3.5 w-3.5 ${apiMode === "demo" ? "text-amber-500" : ""}`} />
              Mode Démo (Local)
            </button>
            <button
              onClick={() => handleModeToggle("real")}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all
                ${apiMode === "real"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                  : "text-slate-400 hover:text-slate-600"
                }
              `}
            >
              <Database className={`h-3.5 w-3.5 ${apiMode === "real" ? "text-blue-500" : ""}`} />
              API Spring Boot
            </button>
          </div>

          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-1 mb-6">
              <h3 className="font-display text-base font-bold text-slate-800">
                Se connecter
              </h3>
              <p className="text-xs text-slate-400">
                Saisissez vos coordonnées pour accéder au tableau de bord.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-[#EF4444] mb-5 leading-normal">
                {error}
              </div>
            )}

            {apiMode === "demo" && (
              <div className="p-3 bg-amber-50/40 border border-amber-100/30 rounded-xl mb-5 flex gap-2.5 items-start">
                <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-amber-800">Accès Démo Immédiat</span>
                  <span className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Utilisez les identifiants pré-remplis pour tester sans lancer le serveur Spring Boot.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <Input
                label="Adresse Email"
                type="email"
                placeholder="nom.prenom@univ.fr"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email", { 
                  required: "L'adresse email est requise",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Adresse email invalide"
                  }
                })}
              />

              {/* Password */}
              <Input
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                placeholder="Saisissez votre mot de passe"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors pointer-events-auto"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register("password", { 
                  required: "Le mot de passe est requis",
                  minLength: {
                    value: 4,
                    message: "Le mot de passe doit faire au moins 4 caractères"
                  }
                })}
              />

              {/* Keep signed in */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-200 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span className="text-xs text-slate-500">Se souvenir de moi</span>
                </label>
                <a href="#forgot" className="text-xs text-[#2563EB] font-semibold hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Login Submit Button */}
              <Button
                type="submit"
                className="w-full mt-6"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link to Inscription */}
        <p className="text-center text-xs text-slate-400">
          Vous n'avez pas de compte ?{" "}
          <Link to="/register" className="text-[#2563EB] font-bold hover:underline">
            Créer un compte universitaire
          </Link>
        </p>
      </div>
    </div>
  );
};
