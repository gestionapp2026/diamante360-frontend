import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/EmptyState";
import { PaginationControls } from "@/components/common/PaginationControls";
import type { PageResponse } from "@/types/api";

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  page?: PageResponse<T>;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyTitle = "Sin resultados",
  emptyDescription = "No hay registros para mostrar todavia.",
  page,
  onPageChange,
  onRowClick,
}: DataTableProps<T>) {
  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Sin esto, react-table usa el indice de cada fila dentro de `data` como
    // key. Al borrar una fila (p. ej. con EliminarConDependenciasButton), el
    // array se acorta y la fila siguiente "hereda" la posicion/DOM/estado de
    // la que se borro, arrastrando cualquier estado local (como un dialogo
    // que quedo abierto) hacia los datos de otra entidad. Usar el id real
    // del recurso evita ese arrastre. Todas las respuestas usadas con
    // DataTable traen un `id` numerico propio.
    getRowId: (row: unknown, index) => {
      const id = (row as { id?: string | number } | null)?.id;
      return id !== undefined && id !== null ? String(id) : String(index);
    },
  });

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {page && onPageChange && (
        <PaginationControls
          page={page.pagina}
          totalPages={page.totalPaginas}
          totalElementos={page.totalElementos}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
