import { useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaginationControlsProps {
  page: number; // 0-indexed
  totalPages: number;
  totalElementos: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, totalElementos, onPageChange }: PaginationControlsProps) {
  const [paginaIngresada, setPaginaIngresada] = useState("");

  if (totalElementos === 0) return null;

  function irAPagina(event: FormEvent) {
    event.preventDefault();
    const numero = Number(paginaIngresada);
    if (!Number.isInteger(numero) || numero < 1 || numero > totalPages) return;
    onPageChange(numero - 1);
    setPaginaIngresada("");
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-3">
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
        {totalPages > 1 && (
          <form onSubmit={irAPagina} className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Ir a</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={paginaIngresada}
              onChange={(e) => setPaginaIngresada(e.target.value)}
              placeholder={String(page + 1)}
              className="h-8 w-16"
              aria-label="Ir a la pagina"
            />
            <Button type="submit" variant="outline" size="sm" disabled={!paginaIngresada}>
              Ir
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
