import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { 
  PiggyBank, 
  Receipt, 
  Wallet, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Tag, 
  PlusCircle, 
  ArrowRight,
  Sparkles,
  Inbox
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { DashboardService } from "../services/DashboardService";
import { ExpenseService } from "../services/ExpenseService";
import { CategoryService } from "../services/CategoryService";
import { DashboardStats, Category, Expense } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Loader } from "../components/Loader";

export const TableauDeBord: React.FC = () => {
  const { apiMode } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form for fast adding
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const stats = await DashboardService.getDashboardData();
      const cats = await CategoryService.getAll();
      setData(stats);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiMode]);

  const handleAddExpense = async (formData: any) => {
    setIsSubmitLoading(true);
    setErrorMsg(null);
    try {
      await ExpenseService.create({
        title: formData.title,
        amount: Number(formData.amount),
        expenseDate: formData.expenseDate,
        categoryId: Number(formData.categoryId),
        description: formData.description || ""
      });
      setIsAddExpenseOpen(false);
      reset();
      // Reload stats
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Impossible de créer la dépense.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (isLoading) {
    return <Loader text="Préparation de votre espace financier..." />;
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Impossible de charger les statistiques du tableau de bord.
      </div>
    );
  }

  const percentSpent = data.monthlyBudget > 0 
    ? Math.min(100, (data.totalExpenses / data.monthlyBudget) * 100) 
    : 0;

  // Custom tooltips for nice styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg border border-slate-800">
          <p className="label">{`${payload[0].name} : ${payload[0].value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert / Streak */}
      {apiMode === "demo" && (
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-200/40 p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <span className="p-2 bg-amber-100/60 rounded-xl text-amber-600 flex-shrink-0">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <h4 className="text-sm font-bold text-amber-900 leading-none">Environnement Démo Académique</h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Ce tableau de bord simule les calculs en temps réel. Vous pouvez ajouter des dépenses pour mettre à jour les graphiques.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-amber-800 border-amber-200 hover:bg-amber-100/50"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <PlusCircle className="h-4 w-4 text-amber-600" />
            Tester un ajout
          </Button>
        </div>
      )}

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Budget Card */}
        <Card hoverable className="border border-slate-100 flex flex-col justify-between h-40">
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Mensuel</span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <PiggyBank className="h-5 w-5" />
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-[#1E293B] font-display leading-none">
                {data.monthlyBudget.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
              <p className="text-[10px] text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Limite globale définie
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card hoverable className="border border-slate-100 flex flex-col justify-between h-40">
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dépenses</span>
              <span className={`p-2 rounded-xl ${percentSpent >= 90 ? "bg-red-50 text-[#EF4444]" : "bg-emerald-50 text-[#22C55E]"}`}>
                <Receipt className="h-5 w-5" />
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-[#1E293B] font-display leading-none">
                {data.totalExpenses.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
              <div className="w-full mt-2.5">
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                  <span>Progression</span>
                  <span>{percentSpent.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${percentSpent >= 90 ? "bg-[#EF4444]" : "bg-[#2563EB]"}`}
                    style={{ width: `${percentSpent}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remaining Budget Card */}
        <Card hoverable className="border border-slate-100 flex flex-col justify-between h-40">
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solde Restant</span>
              <span className={`p-2 rounded-xl ${data.remainingBudget <= 100 ? "bg-amber-50 text-[#F59E0B]" : "bg-[#2563EB]/10 text-[#2563EB]"}`}>
                <Wallet className="h-5 w-5" />
              </span>
            </div>
            <div>
              <span className={`text-2xl font-black font-display leading-none ${data.remainingBudget <= 0 ? "text-[#EF4444]" : "text-[#1E293B]"}`}>
                {data.remainingBudget.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </span>
              <p className="text-[10px] text-slate-400 font-medium mt-1.5 leading-none">
                {data.remainingBudget <= 0 
                  ? "Attention : Budget dépassé !" 
                  : "Solde disponible d'ici la fin du mois."
                }
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Monthly evolution Chart (Left) */}
        <Card className="lg:col-span-3 border border-slate-100">
          <CardHeader>
            <div>
              <CardTitle>Dépenses mensuelles</CardTitle>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Comparaison des coûts globaux des 6 derniers mois</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-blue-600 rounded-full"></span>
              <span className="text-[10px] font-semibold text-slate-500">Coût (€)</span>
            </div>
          </CardHeader>
          <CardContent className="h-72 px-2 pb-2">
            {data.monthlyExpensesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Aucune historique disponible</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyExpensesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(241, 245, 249, 0.4)" }} />
                  <Bar dataKey="montant" fill="#2563EB" radius={[8, 8, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Categories Distribution Chart (Right) */}
        <Card className="lg:col-span-2 border border-slate-100 flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>Répartition par catégorie</CardTitle>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Ventilation des dépenses du mois en cours</p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center h-72">
            {data.categoryDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Aucune dépense ce mois-ci</div>
            ) : (
              <div className="w-full h-full flex flex-col md:flex-row lg:flex-col xl:flex-row items-center justify-around gap-2 pb-4">
                <div className="w-36 h-36 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomTooltip />} />
                      <Pie
                        data={data.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={62}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {data.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend to fit small areas */}
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto text-xs px-2 w-full max-w-[160px]">
                  {data.categoryDistribution.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 select-none">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-slate-500 font-medium truncate flex-1">{entry.name}</span>
                      <span className="text-slate-700 font-bold ml-auto">{entry.value.toFixed(0)}€</span>
                    </div>
                  ))}
                  {data.categoryDistribution.length > 5 && (
                    <span className="text-[9px] text-slate-400 italic text-center mt-1">+{data.categoryDistribution.length - 5} autres</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Recent expenses table */}
      <Card className="border border-slate-100">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Dernières dépenses</CardTitle>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Vos dernières transactions enregistrées</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/depenses")}>
              Voir tout <ArrowRight className="h-3.5 w-3.5 ml-1 text-[#2563EB]" />
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsAddExpenseOpen(true)}>
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {data.recentExpenses.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Inbox className="h-8 w-8 text-slate-300" />
              <p className="text-xs">Aucune dépense enregistrée pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto select-none">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase">
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Titre</th>
                    <th className="px-6 py-3.5">Catégorie</th>
                    <th className="px-6 py-3.5 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-[#1E293B]">
                  {data.recentExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {new Date(expense.expenseDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {expense.title}
                        {expense.description && (
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5 max-w-xs truncate">
                            {expense.description}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5"
                          style={{ backgroundColor: `${expense.category?.color}15`, color: expense.category?.color }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: expense.category?.color }} />
                          {expense.category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900 text-sm">
                        {expense.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Modal Add Expense */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Ajouter une dépense"
        size="md"
      >
        {categories.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs text-slate-500 mb-4">
              Veuillez d'abord créer au moins une catégorie avant d'ajouter une dépense.
            </p>
            <Button size="sm" onClick={() => navigate("/categories")}>Créer une catégorie</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleAddExpense)} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 text-[#EF4444] text-xs font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Title */}
            <Input
              label="Titre de la dépense"
              placeholder="Ex: Abonnement Salle de sport, Courses Auchan..."
              error={errors.title?.message as string}
              {...register("title", { required: "Veuillez saisir un titre" })}
            />

            {/* Row Amount & Date */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Montant (€)"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.amount?.message as string}
                {...register("amount", { 
                  required: "Veuillez saisir un montant",
                  min: { value: 0.01, message: "Le montant doit être supérieur à 0" }
                })}
              />

              <Input
                label="Date de dépense"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                error={errors.expenseDate?.message as string}
                {...register("expenseDate", { required: "Veuillez choisir une date" })}
              />
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Catégorie de dépense</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-xl text-sm py-2.5 px-3 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                {...register("categoryId", { required: "Catégorie requise" })}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-[#EF4444] font-medium mt-0.5">{errors.categoryId.message as string}</p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Description (Optionnelle)</label>
              <textarea
                rows={3}
                placeholder="Ajoutez des détails (ex: facture numéro X, cadeau d'anniversaire...)"
                className="w-full bg-white border border-slate-200 rounded-xl text-sm py-2.5 px-3.5 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
                {...register("description")}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 mt-4">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsAddExpenseOpen(false)}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitLoading}>
                Enregistrer la dépense
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
export default TableauDeBord;
