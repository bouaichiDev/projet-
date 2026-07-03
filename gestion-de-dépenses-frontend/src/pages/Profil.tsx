import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  User, 
  Mail, 
  Key, 
  Check, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  UserCheck, 
  Settings,
  Lock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { AuthService } from "../services/AuthService";

export const Profil: React.FC = () => {
  const { user, updateProfile, apiMode } = useAuth();
  
  // Profile form states
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password form states
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { register: regProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      prenom: user?.firstname || "",
      nom: user?.lastname || "",
      email: user?.email || ""
    }
  });

  const { register: regPass, handleSubmit: handlePassSubmit, watch: watchPass, reset: resetPass, formState: { errors: passErrors } } = useForm();
  const newPass = watchPass("newPassword");

  const onUpdateProfile = async (data: any) => {
    if (!user) return;
    setIsProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      await updateProfile({
        ...user,
        firstname: data.prenom,
        lastname: data.nom,
        email: data.email
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onChangePassword = async (data: any) => {
    setIsPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await AuthService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      setPasswordSuccess(true);
      resetPass({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Impossible de mettre à jour le mot de passe. L'ancien est incorrect.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Veuillez vous connecter pour afficher votre profil.
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans max-w-4xl mx-auto">
      
      {/* Header Profile Summary */}
      <Card className="border border-slate-100 bg-linear-to-br from-white to-slate-50/20">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          
          {/* Avatar frame */}
          <div className="relative h-20 w-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-md border border-blue-500 flex-shrink-0 select-none">
            {(user.firstname?.[0] ?? "")}{(user.lastname?.[0] ?? "")}
            <span className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 border-2 border-white rounded-full" title="Connecté" />
          </div>

          <div className="flex flex-col min-w-0 flex-1 gap-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="font-display text-lg font-bold text-slate-800">
                {user.firstname} {user.lastname}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold self-center border inline-flex items-center gap-1
                ${apiMode === "demo" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}
              `}>
                {apiMode === "demo" ? <Sparkles className="h-2.5 w-2.5" /> : <Database className="h-2.5 w-2.5" />}
                Mode {apiMode === "demo" ? "Démo" : "API Real"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Compte Universitaire sécurisé
            </p>
          </div>

        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Modifier le profil Card */}
        <Card className="border border-slate-100">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Settings className="h-4 w-4" />
              </div>
              <CardTitle>Informations Personnelles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-[#22C55E] text-xs font-semibold rounded-xl flex items-center gap-2">
                  <Check className="h-4 w-4" /> Profil enregistré avec succès.
                </div>
              )}

              {profileError && (
                <div className="p-3 bg-red-50 border border-red-100 text-[#EF4444] text-xs font-semibold rounded-xl">
                  {profileError}
                </div>
              )}

              {/* Row Names */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  leftIcon={<User className="h-4 w-4" />}
                  error={profileErrors.prenom?.message as string}
                  {...regProfile("prenom", { required: "Prénom requis" })}
                />

                <Input
                  label="Nom"
                  leftIcon={<User className="h-4 w-4" />}
                  error={profileErrors.nom?.message as string}
                  {...regProfile("nom", { required: "Nom requis" })}
                />
              </div>

              {/* Email */}
              <Input
                label="Adresse Email"
                type="email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={profileErrors.email?.message as string}
                {...regProfile("email", { 
                  required: "L'adresse email est requise",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Adresse email invalide"
                  }
                })}
              />

              <Button
                type="submit"
                className="w-full mt-4"
                isLoading={isProfileLoading}
                leftIcon={<UserCheck className="h-4 w-4" />}
              >
                Mettre à jour le profil
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Changer le mot de passe Card */}
        <Card className="border border-slate-100">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                <Key className="h-4 w-4" />
              </div>
              <CardTitle>Sécurité & Mot de passe</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4">
              
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-[#22C55E] text-xs font-semibold rounded-xl flex items-center gap-2">
                  <Check className="h-4 w-4" /> Mot de passe modifié avec succès.
                </div>
              )}

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-100 text-[#EF4444] text-xs font-semibold rounded-xl">
                  {passwordError}
                </div>
              )}

              <Input
                label="Ancien mot de passe"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                error={passErrors.oldPassword?.message as string}
                {...regPass("oldPassword", { required: "L'ancien mot de passe est obligatoire" })}
              />

              <Input
                label="Nouveau mot de passe"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                error={passErrors.newPassword?.message as string}
                {...regPass("newPassword", { 
                  required: "Nouveau mot de passe obligatoire",
                  minLength: { value: 6, message: "Le mot de passe doit faire au moins 6 caractères" }
                })}
              />

              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                error={passErrors.confirmNewPassword?.message as string}
                {...regPass("confirmNewPassword", { 
                  required: "Confirmation requise",
                  validate: (val) => val === newPass || "Les nouveaux mots de passe ne correspondent pas"
                })}
              />

              <Button
                type="submit"
                className="w-full mt-4"
                variant="danger"
                isLoading={isPasswordLoading}
                leftIcon={<Key className="h-4 w-4" />}
              >
                Changer le mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};
export default Profil;
