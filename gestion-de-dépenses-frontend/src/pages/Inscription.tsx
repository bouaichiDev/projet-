import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, Check, ArrowRight, Sparkles, Database } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card, CardContent } from "../components/Card";

export const Inscription: React.FC = () => {
  const { register: registerUser, apiMode } = useAuth();
  const navigate = useNavigate();
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const password = watch("password");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser({
        firstname: data.prenom,
        lastname: data.nom,
        email: data.email,
        password: data.password
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Une erreur est survenue lors de l'inscription. L'email est peut-être déjà utilisé."
      );
    } finally {
      setIsLoading(false);
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
            Créer un compte
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enregistrez-vous pour suivre votre budget mensuel
          </p>
        </div>

        <Card className="border border-slate-100 shadow-xl bg-white rounded-2xl">
          <div className="px-6 pt-2 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between h-10">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Compte Universitaire</span>
            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
              {apiMode === "demo" ? (
                <>
                  <Sparkles className="h-3 w-3 text-amber-500" /> Mode Démo
                </>
              ) : (
                <>
                  <Database className="h-3 w-3 text-blue-500" /> Mode API
                </>
              )}
            </span>
          </div>

          <CardContent className="p-6 sm:p-8">
            {success ? (
              <div className="py-6 flex flex-col items-center text-center gap-4">
                <div className="h-12 w-12 bg-emerald-50 text-[#22C55E] rounded-full flex items-center justify-center border border-emerald-100">
                  <Check className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-display text-base font-bold text-slate-800">Inscription réussie !</h4>
                  <p className="text-xs text-slate-500 leading-normal max-w-xs">
                    Votre compte a été créé avec succès. Redirection vers la page de connexion...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-[#EF4444] leading-normal">
                    {error}
                  </div>
                )}

                {/* Name & Firstname Row */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    placeholder="Lucas"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.prenom?.message as string}
                    {...register("prenom", { required: "Requis" })}
                  />

                  <Input
                    label="Nom"
                    placeholder="Martin"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.nom?.message as string}
                    {...register("nom", { required: "Requis" })}
                  />
                </div>

                {/* Email */}
                <Input
                  label="Adresse Email"
                  type="email"
                  placeholder="lucas.martin@univ-paris.fr"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message as string}
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
                  type="password"
                  placeholder="Saisissez un mot de passe robuste"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message as string}
                  {...register("password", { 
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 6,
                      message: "Le mot de passe doit faire au moins 6 caractères"
                    }
                  })}
                />

                {/* Confirm Password */}
                <Input
                  label="Confirmation du mot de passe"
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.confirmPassword?.message as string}
                  {...register("confirmPassword", { 
                    required: "Veuillez confirmer votre mot de passe",
                    validate: (value) => value === password || "Les mots de passe ne correspondent pas"
                  })}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  S'inscrire
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer Link to Connexion */}
        <p className="text-center text-xs text-slate-400">
          Vous possédez déjà un compte ?{" "}
          <Link to="/login" className="text-[#2563EB] font-bold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};
