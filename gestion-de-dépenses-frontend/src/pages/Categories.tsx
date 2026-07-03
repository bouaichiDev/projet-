import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  FolderPlus, 
  Edit2, 
  Trash2, 
  Sparkles,
  Inbox,
  Utensils,
  Gamepad,
  Car,
  Home,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Plane,
  Gift,
  Plus
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CategoryService } from "../services/CategoryService";
import { ExpenseService } from "../services/ExpenseService";
import { Category, Expense } from "../types";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { Dialog } from "../components/Dialog";
import { Loader } from "../components/Loader";

// Dynamic Lucide mapping for safe rendering
const ICON_MAP: Record<string, any> = {
  Utensils,
  Gamepad,
  Car,
  Home,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Plane,
  Gift,
};

const PALETTE = [
  "#2563EB", // Blue
  "#22C55E", // Green
  "#EC4899", // Pink
  "#F59E0B", // Orange
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#14B8A6", // Teal
  "#1E293B", // Slate
];

const AVAILABLE_ICONS = [
  { name: "Alimentation", value: "Utensils" },
  { name: "Loisirs & Fun", value: "Gamepad" },
  { name: "Transport & Autos", value: "Car" },
  { name: "Logement & Factures", value: "Home" },
  { name: "Santé & Soins", value: "HeartPulse" },
  { name: "Études & Travail", value: "GraduationCap" },
  { name: "Shopping & Cadeaux", value: "ShoppingBag" },
  { name: "Voyages & Sorties", value: "Plane" },
  { name: "Fêtes & Dons", value: "Gift" },
];

export const Categories: React.FC = () => {
  const { apiMode } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [selectedIcon, setSelectedIcon] = useState("Utensils");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Delete Dialog actions
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const cats = await CategoryService.getAll();
      const exps = await ExpenseService.getAll();
      setCategories(cats);
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

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setSelectedColor(PALETTE[0]);
    setSelectedIcon("Utensils");
    reset({ name: "" });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setSelectedColor(cat.color);
    setSelectedIcon(cat.icon);
    reset({ name: cat.name });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitLoading(true);
    setErrorMsg(null);
    try {
      if (editingCategory) {
        await CategoryService.update(editingCategory.id, {
          name: formData.name,
          color: selectedColor,
          icon: selectedIcon
        });
      } else {
        await CategoryService.create({
          name: formData.name,
          color: selectedColor,
          icon: selectedIcon
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement de la catégorie.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleOpenDelete = (cat: Category) => {
    setDeletingCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleteLoading(true);
    try {
      await CategoryService.delete(deletingCategory.id);
      setIsDeleteOpen(false);
      setDeletingCategory(null);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Safe renderer for Category Icons
  const renderIcon = (iconName: string, color: string, className = "h-5 w-5") => {
    const Component = ICON_MAP[iconName] || Utensils;
    return <Component className={className} style={{ color }} />;
  };

  // Compute category details
  const getCategoryStats = (catId: number) => {
    const catExpenses = expenses.filter((e) => e.category?.id === catId);
    const count = catExpenses.length;
    const totalAmount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { count, totalAmount };
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Top Banner & Quick Creation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-slate-800 leading-none">Vos Catégories</h2>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Organisez vos budgets et repérez rapidement les dépenses récurrentes</p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="shadow-sm"
          onClick={handleOpenAdd}
          leftIcon={<FolderPlus className="h-4.5 w-4.5" />}
        >
          Créer une catégorie
        </Button>
      </div>

      {isLoading ? (
        <Loader text="Chargement de vos catégories de dépenses..." />
      ) : categories.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-slate-100/60 rounded-full text-slate-400 mb-4 animate-bounce">
            <Inbox className="h-8 w-8" />
          </div>
          <h4 className="font-display text-sm font-semibold text-slate-800">Aucune catégorie existante</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-normal">
            Commencez par créer une catégorie (ex: Alimentation, Loisirs...) pour pouvoir y classer vos futures dépenses.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="mt-6">
            <Plus className="h-4 w-4" /> Ajouter une catégorie
          </Button>
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const stats = getCategoryStats(cat.id);
            return (
              <Card key={cat.id} hoverable className="border border-slate-100/80 flex flex-col justify-between h-52">
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  
                  {/* Category Top details */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      {/* Colored icon box */}
                      <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-300"
                        style={{ backgroundColor: `${cat.color}10`, borderColor: `${cat.color}20` }}
                      >
                        {renderIcon(cat.icon, cat.color, "h-5 w-5")}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-display font-bold text-slate-800 text-sm leading-none">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">
                          {stats.count} {stats.count <= 1 ? "dépense" : "dépenses"}
                        </span>
                      </div>
                    </div>

                    {/* Quick Color Dot */}
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>

                  {/* Pricing Overview */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Montant global dépensé</span>
                    <span className="text-xl font-black text-slate-900 font-display mt-1 block">
                      {stats.totalAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-3 mt-3">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors"
                      title="Modifier la catégorie"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(cat)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer la catégorie"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit / Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
        size="md"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 text-[#EF4444] text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          <Input
            label="Nom de la catégorie"
            placeholder="Ex: Restauration Universitaire, Sport, Streaming..."
            error={errors.name?.message as string}
            {...register("name", { required: "Le nom est obligatoire" })}
          />

          {/* Color Picker */}
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-700">Sélectionner une couleur</label>
            <div className="flex flex-wrap gap-2.5">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="h-8 w-8 rounded-full border-2 transition-transform duration-200 cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95"
                  style={{ 
                    backgroundColor: color,
                    borderColor: selectedColor === color ? "#000000" : "transparent"
                  }}
                >
                  {selectedColor === color && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-700">Sélectionner une icône d'illustration</label>
            <div className="grid grid-cols-5 gap-3.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              {AVAILABLE_ICONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSelectedIcon(item.value)}
                  className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.05]
                    ${selectedIcon === item.value 
                      ? "bg-white border-blue-500 shadow-xs" 
                      : "bg-white/40 border-transparent hover:border-slate-200"
                    }
                  `}
                  title={item.name}
                >
                  {renderIcon(item.value, selectedIcon === item.value ? selectedColor : "#94A3B8", "h-5 w-5")}
                  <span className={`text-[9px] font-semibold truncate max-w-[64px]
                    ${selectedIcon === item.value ? "text-slate-800 font-bold" : "text-slate-400"}
                  `}>
                    {item.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 mt-4">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitLoading}>
              {editingCategory ? "Enregistrer" : "Créer la catégorie"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation Dialog */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer cette catégorie ?"
        description={`Attention : En supprimant la catégorie "${deletingCategory?.name}", TOUTES les dépenses associées seront également supprimées définitivement ! Cette opération est irréversible.`}
        type="danger"
        confirmText="Tout supprimer"
        isLoading={isDeleteLoading}
      />

    </div>
  );
};
export default Categories;
