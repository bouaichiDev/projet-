import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic for ellipsis
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages.map((page, idx) => {
      if (page === "...") {
        return (
          <span key={`dots-${idx}`} className="px-2 text-slate-400 select-none text-xs">
            ...
          </span>
        );
      }

      const isCurrent = page === currentPage;
      return (
        <button
          key={`page-${page}`}
          onClick={() => onPageChange(page as number)}
          className={`h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors
            ${isCurrent 
              ? "bg-[#2563EB] text-white" 
              : "text-[#1E293B] hover:bg-slate-100"
            }
          `}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100 select-none">
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-slate-400">
          Page <span className="font-semibold text-[#1E293B]">{currentPage}</span> sur{" "}
          <span className="font-semibold text-[#1E293B]">{totalPages}</span>
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 mx-1">{renderPageNumbers()}</div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
