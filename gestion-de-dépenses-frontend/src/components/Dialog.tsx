import React from "react";
import { AlertTriangle, Trash2, HelpCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  type?: "danger" | "warning" | "info";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "warning",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  isLoading = false
}) => {
  const icons = {
    danger: <div className="p-3 bg-red-50 text-red-500 rounded-full"><Trash2 className="h-6 w-6" /></div>,
    warning: <div className="p-3 bg-amber-50 text-amber-500 rounded-full"><AlertTriangle className="h-6 w-6" /></div>,
    info: <div className="p-3 bg-blue-50 text-blue-500 rounded-full"><HelpCircle className="h-6 w-6" /></div>,
  };

  const confirmVariants = {
    danger: "danger" as const,
    warning: "warning" as const,
    info: "primary" as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        {icons[type]}
        
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 w-full mt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariants[type]}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
