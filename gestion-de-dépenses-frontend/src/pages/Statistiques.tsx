import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Calendar, 
  ShoppingBag, 
  Layers,
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
  LineChart, 
  Line, 
  Legend 
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { DashboardService } from "../services/DashboardService";
import { StatsOverview } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Loader } from "../components/Loader";

export const Statistiques: React.FC = () => {
  const { apiMode } = useAuth();
  const [data, setData] = useState<StatsOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const stats = await DashboardService.getStatistics();
      setData(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiMode]);

  if (isLoading) {
    return <Loader text="Analyse et consolidation de votre historique financier..." />;
  }

  if (!data || data.categoryDistribution.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
          <Inbox className="h-8 w-8" />
        </div>
        <h4 className="font-display text-sm font-semibold text-slate-800">Données insuffisantes</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
          Vous devez ajouter des dépenses dans vos catégories pour pouvoir consulter les graphiques d'analyses statistiques.
        </p>
      </div>
    );
  }

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg border border-slate-800">
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="leading-normal">
              {`${p.name} : ${p.value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* 4 Stat Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total transaction count */}
        <Card className="border border-slate-100 flex items-center justify-between p-5 h-24">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Transactions</span>
            <span className="text-xl font-black text-slate-800 font-display mt-1">
              {data.summary.totalTransactions}
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-xl">
            <Layers className="h-5 w-5" />
          </div>
        </Card>

        {/* Average cost */}
        <Card className="border border-slate-100 flex items-center justify-between p-5 h-24">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Panier Moyen</span>
            <span className="text-xl font-black text-slate-800 font-display mt-1">
              {data.summary.averageExpense.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-[#22C55E] rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
        </Card>

        {/* Most expensive Category */}
        <Card className="border border-slate-100 flex items-center justify-between p-5 h-24">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pôle Principal</span>
            <span className="text-sm font-black text-slate-800 font-display mt-1 truncate max-w-[150px]">
              {data.summary.mostExpensiveCategory?.category || "N/A"}
            </span>
          </div>
          <div className="p-2.5 bg-red-50 text-red-500 rounded-xl flex-shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </Card>

        {/* Highest expenditure */}
        <Card className="border border-slate-100 flex items-center justify-between p-5 h-24">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Achat Maximal</span>
            <span className="text-sm font-black text-slate-800 font-display mt-1 truncate max-w-[150px]">
              {data.summary.highestExpense?.title || "N/A"}
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 text-[#F59E0B] rounded-xl flex-shrink-0">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </Card>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BarChart: Budget vs Expense comparison */}
        <Card className="border border-slate-100">
          <CardHeader>
            <div>
              <CardTitle>Budget vs Dépenses réelles</CardTitle>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Comparatif mensuel sur le dernier semestre</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold select-none">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-[#2563EB] rounded-full" /> Dépenses</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-slate-200 rounded-full" /> Budget</span>
            </div>
          </CardHeader>
          <CardContent className="h-72 px-2 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(241, 245, 249, 0.3)" }} />
                <Bar dataKey="Dépenses" fill="#2563EB" radius={[5, 5, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Budget" fill="#E2E8F0" radius={[5, 5, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LineChart: Cumulative Expenses in current month */}
        <Card className="border border-slate-100">
          <CardHeader>
            <div>
              <CardTitle>Courbe d'évolution du mois</CardTitle>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Évolution cumulée des coûts sur les 15 derniers jours</p>
            </div>
          </CardHeader>
          <CardContent className="h-72 px-2 pb-2">
            {data.lineChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Pas assez de données pour tracer la courbe</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.lineChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 9 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="Montant" 
                    name="Dépenses cumulées"
                    stroke="#2563EB" 
                    strokeWidth={3} 
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Category breakdown table (Left 3 columns) */}
        <Card className="lg:col-span-3 border border-slate-100">
          <CardHeader>
            <div>
              <CardTitle>Répartition analytique par catégorie</CardTitle>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Synthèse des parts et volumes dépensés par secteur d'activités</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase">
                    <th className="px-5 py-3.5">Catégorie</th>
                    <th className="px-5 py-3.5 text-center">Volume</th>
                    <th className="px-5 py-3.5 text-right">Montant</th>
                    <th className="px-5 py-3.5 text-right">Part (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-[#1E293B]">
                  {data.categoryDistribution.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-5 py-4 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                        <span className="font-semibold text-slate-800">{row.category}</span>
                      </td>
                      <td className="px-5 py-4 text-center text-slate-400 font-mono">
                        {row.count} trx
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-slate-900">
                        {row.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <span className="font-semibold text-slate-500">{row.percentage}%</span>
                          {/* Mini micro bar */}
                          <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full rounded-full" style={{ width: `${row.percentage}%`, backgroundColor: row.color }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Monthly evolution list (Right 2 columns) */}
        <Card className="lg:col-span-2 border border-slate-100 flex flex-col">
          <CardHeader>
            <div>
              <CardTitle>Évolution de l'activité</CardTitle>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Historique des coûts globaux par période mensuelle</p>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col justify-between">
            <div className="divide-y divide-slate-50 overflow-y-auto max-h-72">
              {data.monthlyEvolution.map((row, idx) => (
                <div key={idx} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/20 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-800">{row.month}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{row.count} {row.count <= 1 ? "transaction" : "transactions"}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 font-display">
                    {row.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};
export default Statistiques;
