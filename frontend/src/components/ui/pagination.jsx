import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  showInfo = true,
  showPageNumbers = true,
  showItemsPerPage = true,
}) {
  // Se não há páginas para mostrar e não temos seletor de itens por página
  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  // Se não há itens
  if (totalItems === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 1) {
      return [];
    }

    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the edges
      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageInput = (e) => {
    if (e.key === 'Enter') {
      const input = e.target;
      const page = parseInt(input.value);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
        input.value = currentPage; // Reset para valor atual
      }
    }
  };

  const handleGoButtonClick = (e) => {
    const input = e.target.previousElementSibling;
    const page = parseInt(input.value);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      input.value = currentPage; // Reset para valor atual
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} data-testid="pagination">
      {showInfo && totalItems > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {startItem} a {endItem} de {totalItems} produtos
        </div>
      )}
      
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {showItemsPerPage && totalItems > 0 && (
            <>
              <label htmlFor="itemsPerPage" className="text-sm">
                Itens por página:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                data-testid="items-per-page-select"
              >
                {[5, 10, 20, 50].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md border transition-colors",
              currentPage === 1
                ? "border-muted bg-muted text-muted-foreground cursor-not-allowed"
                : "border-input bg-background text-foreground hover:bg-muted"
            )}
            aria-label="Página anterior"
            data-testid="previous-page-button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {showPageNumbers && pageNumbers.length > 0 && (
            <div className="flex items-center gap-1" data-testid="page-numbers">
              {pageNumbers.map((pageNumber, index) => {
                if (pageNumber === 'ellipsis-start' || pageNumber === 'ellipsis-end') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="h-8 w-8 flex items-center justify-center text-muted-foreground"
                    >
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-md border text-sm transition-colors",
                      currentPage === pageNumber
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-muted"
                    )}
                    aria-label={`Ir para página ${pageNumber}`}
                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                    data-testid={`page-button-${pageNumber}`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages === 0}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md border transition-colors",
              currentPage === totalPages || totalPages === 0
                ? "border-muted bg-muted text-muted-foreground cursor-not-allowed"
                : "border-input bg-background text-foreground hover:bg-muted"
            )}
            aria-label="Próxima página"
            data-testid="next-page-button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {totalPages > 0 && (
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
          )}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max={totalPages}
                defaultValue={currentPage}
                onKeyDown={handlePageInput}
                className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
                data-testid="page-input"
              />
              <button
                onClick={handleGoButtonClick}
                className="h-8 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted transition-colors"
                data-testid="go-button"
              >
                Ir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
