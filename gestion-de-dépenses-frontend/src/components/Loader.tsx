import React from "react";

interface LoaderProps {
  type?: "full" | "block" | "inline";
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ type = "block", text = "Chargement..." }) => {
  if (type === "full") {
    return (
      <div className="fixed inset-0 bg-slate-900/5 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-3">
          <div className="h-9 w-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          {text && <p className="text-xs font-semibold text-slate-700 animate-pulse">{text}</p>}
        </div>
      </div>
    );
  }

  if (type === "inline") {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <div className="h-3.5 w-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
        {text && <span>{text}</span>}
      </div>
    );
  }

  return (
    <div className="w-full py-16 flex flex-col items-center justify-center gap-3">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      {text && <p className="text-xs text-slate-500 font-medium animate-pulse">{text}</p>}
    </div>
  );
};
