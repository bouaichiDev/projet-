import React from "react";
import { LucideIcon, HelpCircle } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = HelpCircle,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
      <div className="p-4 bg-slate-100/60 rounded-full text-slate-400 mb-4 animate-bounce duration-1000">
        <Icon className="h-8 w-8" />
      </div>

      <h4 className="font-display text-base font-semibold text-[#1E293B] mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
