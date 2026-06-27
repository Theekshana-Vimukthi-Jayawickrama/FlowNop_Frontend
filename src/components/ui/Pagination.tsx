import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 select-none border-t border-border-color/60 mt-4">
      {/* Items Range Summary */}
      <div className="text-xs text-text-muted font-bold text-center sm:text-left">
        Showing <span className="text-text-main">{startItem}</span> to{' '}
        <span className="text-text-main">{endItem}</span> of{' '}
        <span className="text-text-main">{totalItems}</span> tasks
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 min-w-[36px] h-9 flex items-center justify-center"
          aria-label="Previous Page"
          id="prev-page-btn"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
        </Button>

        {pageNumbers.map((p) => {
          const isActive = p === currentPage;
          return (
            <Button
              key={p}
              variant={isActive ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 flex items-center justify-center text-xs font-bold ${
                isActive ? '' : 'text-text-muted hover:text-text-main'
              }`}
              id={`page-btn-${p}`}
            >
              {p}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 min-w-[36px] h-9 flex items-center justify-center"
          aria-label="Next Page"
          id="next-page-btn"
        >
          <ChevronRight className="w-4 h-4 shrink-0" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
