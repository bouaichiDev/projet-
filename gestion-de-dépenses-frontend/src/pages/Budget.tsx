import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  PiggyBank, 
  Receipt, 
  Wallet, 
  Edit3, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BudgetService } from "../services/BudgetService";
import { ExpenseService } from "../services/ExpenseService";
import { Budget, Expense } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Loader } from "../components/Loader";

export const BudgetPage: React.FC = () => {
  const { apiMode } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const b = await BudgetService.get();
      const exps = await ExpenseService.getAll();
      setBudget(b);
      setExpenses(exps);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiMode]);

  const handleEditBudget = async (formData: any) => {
    if (!budget) return;
    setIsSubmitLoading(true);
    setErrorMsg(null);
    try {
      const updatedBudget = {
        ...budget,
        amount: Number(formData.amount)
      };
      await BudgetService.update(updatedBudget);
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors du changement de budget.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (!budget) return;
    reset({ amount: budget.amount });
    setErrorMsg(null);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return <Loader text="Chargement de vos objectifs budgétaires..." />;
  }

  if (!budget) {
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Impossible de charger le budget mensuel.
      </div>
    );
  }

  // Calculate current month's expenses
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.expenseDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, budget.amount - totalSpent);
  const percentageUsed = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

  // Dynamic coaching feedback
  const getBudgetCoaching = () => {
    if (percentageUsed === 0) {
      return {
        title: "Prêt à démarrer !",
        description: "Vous n'avez pas encore enregistré de dépenses ce mois-ci. Définissez vos budgets et suivez vos coûts.",
        variant: "info",
        icon: <Info className="h-5 w-5 text-blue-600" />
      };
    }
    if (percentageUsed < 50) {
      return {
        title: "Excellent contrôle !",
        description: "Vous avez consommé moins de la moitié de votre budget. Vos finances sont saines et parfaitement maîtrisées. Continuez ainsi !",
        variant: "success",
        icon: <CheckCircle className="h-5 w-5 text-emerald-600" />
      };
    }
    if (percentageUsed < 80) {
      return {
        title: "Suivi modéré",
        description: "Attention, vous avez consommé plus de 50% de votre budget mensuel. Évitez les dépenses superflues d'ici la fin du mois.",
        variant: "warning",
        icon: <Info className="h-5 w-5 text-amber-600" />
      };
    }
    if (percentageUsed < 100) {
      return {
        title: "Seuil critique atteint !",
        description: "Alerte : Vous approchez de votre limite globale autorisée. Veuillez restreindre tout achat non-vital pour rester dans les clous.",
        variant: "critical",
        icon: <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
      };
    }
    return {
      title: "Budget global dépassé !",
      description: "Vous avez consommé l'intégralité de votre budget. Vos dépenses excèdent la limite fixée. Veuillez ajuster votre budget ou réduire drastiquement vos coûts.",
      variant: "over",
      icon: <AlertTriangle className="h-5 w-5 text-[#EF4444] animate-bounce" />
    };
  };

  const coach = getBudgetCoaching();

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Upper Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Budget Limit Card */}
        <Card className="border border-slate-100 flex flex-col justify-between h-40">
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget mensuel</span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <PiggyBank className="h-5 w-5" />
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 font-display leading-none">
                  {budget.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block">Limite globale autorisée</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleOpenEdit} className="h-8 py-0 px-2 rounded-lg text-slate-500 border-slate-200 hover:text-blue-600 hover:border-blue-200">
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Spent Card */}
        <Card className="border border-slate-100 flex flex-col justify-between h-40">
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Montant dépensé</span>
              <span className={`p-2 rounded-xl ${percentageUsed >= 90 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}>
                <Receipt className="h-5 w-5" />
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 font-display leading-none">
                {totalSpent.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block">Cumulé sur le mois en cours</span>
            </div>
          </CardContent>
        </Card>

        {/* Remaining balance */}
        <Card className="border border-slate-100 flex flex-col justify-between h-40">
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solde restant</span>
              <span className={`p-2 rounded-xl ${remaining <= 100 ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-[#2563EB]"}`}>
                <Wallet className="h-5 w-5" />
              </span>
            </div>
            <div>
              <span className={`text-2xl font-black font-display leading-none ${totalSpent > budget.amount ? "text-red-500" : "text-slate-900"}`}>
                {totalSpent > budget.amount 
                  ? `-${(totalSpent - budget.amount).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`
                  : remaining.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
                }
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block">
                {totalSpent > budget.amount ? "Déficit budgétaire actuel" : "Marge de sécurité disponible"}
              </span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Consumption Meter and Coaching Card */}
      <Card className="border border-slate-100">
        <CardHeader>
          <div>
            <CardTitle>Jauge d'utilisation budgétaire</CardTitle>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Représentation visuelle de votre enveloppe financière</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Progress Bar with markers */}
          <div className="space-y-2 select-none">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{totalSpent.toFixed(2)} € dépensés</span>
              <span className={`${percentageUsed >= 90 ? "text-red-600" : "text-blue-600"}`}>{percentageUsed.toFixed(1)}% consommés</span>
            </div>
            
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
              <div 
                className={`h-full rounded-full transition-all duration-700 
                  ${percentageUsed < 50 ? "bg-[#22C55E]" : ""}
                  ${percentageUsed >= 50 && percentageUsed < 80 ? "bg-[#2563EB]" : ""}
                  ${percentageUsed >= 80 && percentageUsed < 100 ? "bg-[#F59E0B]" : ""}
                  ${percentageUsed >= 100 ? "bg-[#EF4444]" : ""}
                `}
                style={{ width: `${Math.min(100, percentageUsed)}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-bold select-none pt-1">
              <span>0% (Début)</span>
              <span>50% (Moitié)</span>
              <span>80% (Seuil critique)</span>
              <span>100% (Limite : {budget.amount} €)</span>
            </div>
          </div>

          {/* Dynamic Coaching alert box */}
          <div className={`p-4.5 rounded-2xl border flex gap-4 items-start transition-colors duration-200
            ${coach.variant === "success" ? "bg-emerald-50/50 border-emerald-100 text-emerald-900" : ""}
            ${coach.variant === "warning" ? "bg-amber-50/50 border-amber-100 text-amber-900" : ""}
            ${coach.variant === "info" ? "bg-blue-50/40 border-blue-100/40 text-blue-900" : ""}
            ${coach.variant === "critical" || coach.variant === "over" ? "bg-red-50/50 border-red-100 text-red-900" : ""}
          `}>
            <span className={`p-2 rounded-xl flex-shrink-0 
              ${coach.variant === "success" ? "bg-emerald-100/60" : ""}
              ${coach.variant === "warning" ? "bg-amber-100/60" : ""}
              ${coach.variant === "info" ? "bg-blue-100/60" : ""}
              ${coach.variant === "critical" || coach.variant === "over" ? "bg-red-100/60" : ""}
            `}>
              {coach.icon}
            </span>
            <div className="flex flex-col">
              <h4 className="text-sm font-bold leading-none">{coach.title}</h4>
              <p className="text-xs text-slate-500 leading-normal mt-1.5">{coach.description}</p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Modify budget limit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Modifier la limite budgétaire"
        size="sm"
      >
        <form onSubmit={handleSubmit(handleEditBudget)} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 text-[#EF4444] text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          <Input
            label="Nouveau budget mensuel (€)"
            type="number"
            step="50"
            placeholder="Ex: 1200, 1500, 2000..."
            error={errors.amount?.message as string}
            {...register("amount", { 
              required: "Veuillez saisir un budget limite",
              min: { value: 10, message: "Le budget doit être d'au moins 10 €" }
            })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 mt-4">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitLoading}>
              Mettre à jour
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
export default BudgetPage;
