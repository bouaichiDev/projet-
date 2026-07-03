import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Tag, 
  Filter, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw,
  Inbox
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ExpenseService } from "../services/ExpenseService";
import { CategoryService } from "../services/CategoryService";
import { Expense, Category } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { Dialog } from "../components/Dialog";
import { SearchInput } from "../components/SearchInput";
import { Pagination } from "../components/Pagination";
import { Loader } from "../components/Loader";

export const Depenses: React.FC = () => {
  const { apiMode } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Delete Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const cats = await CategoryService.getAll();
      setCategories(cats);
      
      // Load and filter expenses
      const data = await ExpenseService.filter({
        categoryId: selectedCatId || undefined,
        date: selectedDate || undefined,
        title: searchQuery || undefined
      });
      setExpenses(data);
      setCurrentPage(1); // Reset page on filter
    } catch (err) {
      console.error("Erreur de chargement des données", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCatId, selectedDate, apiMode]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingExpense(null);
    reset({
      title: "",
      amount: "",
      expenseDate: new Date().toISOString().split("T")[0],
      categoryId: categories[0]?.id || "",
      description: ""
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    reset({
      title: expense.title,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      categoryId: expense.category.id,
      description: expense.description || ""
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Submit Add or Edit Form
  const handleFormSubmit = async (formData: any) => {
    setIsSubmitLoading(true);
    setErrorMsg(null);
    try {
      if (editingExpense) {
        await ExpenseService.update(editingExpense.id, {
          title: formData.title,
          amount: Number(formData.amount),
          expenseDate: formData.expenseDate,
          categoryId: Number(formData.categoryId),
          description: formData.description
        });
      } else {
        await ExpenseService.create({
          title: formData.title,
          amount: Number(formData.amount),
          expenseDate: formData.expenseDate,
          categoryId: Number(formData.categoryId),
          description: formData.description
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    setIsDeleteLoading(true);
    try {
      await ExpenseService.delete(deletingExpense.id);
      setIsDeleteOpen(false);
      setDeletingExpense(null);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Sort and Paginate Expenses
  const processedExpenses = [...expenses].sort((a, b) => {
    if (sortBy === "date") {
      const t1 = new Date(a.expenseDate).getTime();
      const t2 = new Date(b.expenseDate).getTime();
      return sortOrder === "asc" ? t1 - t2 : t2 - t1;
    } else {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  const totalPages = Math.ceil(processedExpenses.length / itemsPerPage);
  const paginatedExpenses = processedExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 select-none">
      
      {/* Filtering Header Card */}
      <Card className="border border-slate-100">
        <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-end justify-between">
          
          {/* Filters Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:flex-1">
            
            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par titre..."
              label="Recherche de dépenses"
            />

            {/* Category Select Filter */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-400" /> Catégorie
              </label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl text-sm py-2.5 px-3 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker Filter */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date précise
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl text-sm py-2 px-3 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

          </div>

          {/* Quick Clear & Add Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
            {(searchQuery || selectedCatId || selectedDate) && (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCatId("");
                  setSelectedDate("");
                }}
                className="flex-1 md:flex-none"
              >
                Réinitialiser
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenAdd}
              className="flex-1 md:flex-none shadow-sm"
              leftIcon={<Plus className="h-4.5 w-4.5" />}
            >
              Ajouter
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Main Expenses Table */}
      <Card className="border border-slate-100">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Liste des dépenses</CardTitle>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Affichage de {paginatedExpenses.length} transactions sur {expenses.length} totales
            </p>
          </div>
          
          {/* Sorting controls */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Trier par :</span>
            <button
              onClick={() => toggleSort("date")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors
                ${sortBy === "date" ? "bg-slate-100 text-blue-600" : "hover:bg-slate-50"}
              `}
            >
              Date {sortBy === "date" && (sortOrder === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
            </button>
            <button
              onClick={() => toggleSort("amount")}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors
                ${sortBy === "amount" ? "bg-slate-100 text-blue-600" : "hover:bg-slate-50"}
              `}
            >
              Montant {sortBy === "amount" && (sortOrder === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <Loader text="Chargement de vos transactions..." />
          ) : paginatedExpenses.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="p-4 bg-slate-100/60 rounded-full text-slate-400 mb-4 animate-pulse">
                <Inbox className="h-8 w-8" />
              </div>
              <h4 className="font-display text-sm font-semibold text-slate-800">Aucune dépense trouvée</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm leading-normal">
                Aucune transaction ne correspond à vos filtres actuels. Modifiez vos critères ou ajoutez une nouvelle dépense.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Titre & Détails</th>
                    <th className="px-6 py-4">Catégorie</th>
                    <th className="px-6 py-4 text-right">Montant</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-[#1E293B]">
                  {paginatedExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Date */}
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {new Date(expense.expenseDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </td>
                      
                      {/* Title & Description */}
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <span className="text-sm">{expense.title}</span>
                        {expense.description && (
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5 max-w-xs truncate" title={expense.description}>
                            {expense.description}
                          </span>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="px-6 py-4">
                        <span 
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5"
                          style={{ backgroundColor: `${expense.category?.color}15`, color: expense.category?.color }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: expense.category?.color }} />
                          {expense.category?.name}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right font-black text-slate-950 text-sm">
                        {expense.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(expense)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors"
                            title="Modifier cette dépense"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(expense)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer cette dépense"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Edit / Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? "Modifier la dépense" : "Ajouter une dépense"}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 text-[#EF4444] text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          <Input
            label="Titre de la dépense"
            placeholder="Ex: Facture électricité, Déjeuner CROUS..."
            error={errors.title?.message as string}
            {...register("title", { required: "Veuillez saisir un titre de dépense" })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Montant (€)"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.amount?.message as string}
              {...register("amount", { 
                required: "Montant requis",
                min: { value: 0.01, message: "Le montant doit être supérieur à 0" }
              })}
            />

            <Input
              label="Date de la dépense"
              type="date"
              error={errors.expenseDate?.message as string}
              {...register("expenseDate", { required: "Date requise" })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Catégorie</label>
            <select
              className="w-full bg-white border border-slate-200 rounded-xl text-sm py-2.5 px-3 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              {...register("categoryId", { required: "Veuillez choisir une catégorie" })}
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Description (Optionnelle)</label>
            <textarea
              rows={3}
              placeholder="Ajoutez des détails..."
              className="w-full bg-white border border-slate-200 rounded-xl text-sm py-2.5 px-3.5 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
              {...register("description")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 mt-4">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitLoading}>
              {editingExpense ? "Mettre à jour" : "Ajouter la dépense"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation dialog */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer cette dépense ?"
        description={`Êtes-vous sûr de vouloir supprimer définitivement la dépense "${deletingExpense?.title}" d'un montant de ${deletingExpense?.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} ? Cette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        isLoading={isDeleteLoading}
      />

    </div>
  );
};
export default Depenses;
