import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number; // 0-indexed
  totalPages: number;
  totalElementos: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, totalElementos, onPageChange }: PaginationControlsProps) {
  if (totalElementos === 0) return null;

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-muted-foreground">
        Pagina {page + 1} de {Math.max(totalPages, 1)} · {totalElementos} registros
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
