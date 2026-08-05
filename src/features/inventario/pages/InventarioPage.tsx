import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Boxes, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useProductos } from "@/features/inventario/hooks/use-productos";
import type { ProductoResumen } from "@/features/inventario/types";
import { formatNumber } from "@/lib/format";

export function InventarioPage() {
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const { data, isLoading } = useProductos({ page, size: 10, sort: "nombre,asc" });

  const columns = useMemo<ColumnDef<ProductoResumen, any>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: "Producto",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.nombre}</p>
            {row.original.categoriaNombre && (
              <p className="text-xs text-muted-foreground">{row.original.categoriaNombre}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "unidadMedida",
        header: "Unidad",
        cell: ({ row }) => row.original.unidadMedida,
      },
      {
        accessorKey: "stockActual",
        header: "Stock actual",
        cell: ({ row }) => formatNumber(row.original.stockActual),
      },
      {
        accessorKey: "stockMinimo",
        header: "Stock minimo",
        cell: ({ row }) => formatNumber(row.original.stockMinimo),
      },
      {
        id: "estado",
        header: "Estado",
        cell: ({ row }) =>
          row.original.stockBajo || row.original.stockActual <= row.original.stockMinimo ? (
            <StatusBadge label="Stock bajo" tone="warning" />
          ) : (
            <StatusBadge label="Normal" tone="success" />
          ),
      },
      {
        id: "acciones",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/productos/${row.original.id}/movimientos`)}
            >
              <ClipboardList className="size-4" />
              Ver kardex
            </Button>
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        description="Consulta el stock de productos terminados y su historial de movimientos"
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Boxes className="size-4" />
        Productos con stock igual o menor al minimo se resaltan como "Stock bajo".
      </div>

      <DataTable
        columns={columns}
        data={data?.contenido ?? []}
        isLoading={isLoading}
        page={data}
        onPageChange={setPage}
        emptyTitle="Sin productos"
        emptyDescription="No hay productos registrados todavia."
      />
    </div>
  );
}
