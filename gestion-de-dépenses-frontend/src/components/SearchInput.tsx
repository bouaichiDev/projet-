import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "./Input";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  label?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  label,
  placeholder = "Rechercher...",
  className = "",
  ...props
}) => {
  const handleClear = () => {
    onChange("");
    if (onClear) onClear();
  };

  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`pl-10 pr-10 ${className}`}
      leftIcon={<Search className="h-4 w-4 text-slate-400" />}
      rightIcon={
        value ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors pointer-events-auto"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
};
