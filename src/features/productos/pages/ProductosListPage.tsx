import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, activoTone } from "@/components/common/StatusBadge";
import { ProductoCrearDialog } from "@/features/productos/components/ProductoCrearDialog";
import { useCategorias } from "@/features/productos/hooks/use-categorias";
import { useProductos } from "@/features/productos/hooks/use-productos";
import type { ProductoResponse } from "@/features/productos/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency, formatNumber } from "@/lib/format";
import { PERMISOS } from "@/types/enums";
import { Plus } from "lucide-react";

export function ProductosListPage() {
  const navigate = useNavigate();
  const { puede } = usePermiso();

  const [page, setPage] = useState(0);
  const [categoriaId, setCategoriaId] = useState<string>("todas");
  const [open, setOpen] = useState(false);

  const { data: categorias } = useCategorias();
  const { data, isLoading } = useProductos({ page, size: 10, sort: "nombre,asc" });

  const productosFiltrados =
    categoriaId === "todas"
      ? (data?.contenido ?? [])
      : (data?.contenido ?? []).filter((p) => String(p.categoriaId) === categoriaId);

  const columns: ColumnDef<ProductoResponse, any>[] = useMemo(() => [
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "categoriaNombre", header: "Categoria" },
    { accessorKey: "tipoVenta", header: "Tipo de venta" },
    { accessorKey: "unidadMedida", header: "Unidad" },
    {
      accessorKey: "precioVenta",
      header: "Precio de venta",
      cell: ({ row }) => formatCurrency(row.original.precioVenta),
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => `${formatNumber(row.original.stockActual)} / ${formatNumber(row.original.stockMinimo)}`,
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={row.original.activo ? "Activo" : "Inactivo"} tone={activoTone(row.original.activo)} />
          {row.original.stockBajo && <StatusBadge label="Stock bajo" tone="warning" />}
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Gestiona el catalogo de productos terminados."
        actions={
          puede(PERMISOS.PRODUCTO_CREAR) && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Nuevo producto
            </Button>
          )
        }
      />

      <div className="max-w-xs">
        <Select value={categoriaId} onValueChange={setCategoriaId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas las categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorias</SelectItem>
            {categorias?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={productosFiltrados}
        isLoading={isLoading}
        page={categoriaId === "todas" ? data : undefined}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/productos/${row.id}`)}
        emptyTitle="Sin productos"
        emptyDescription="No se encontraron productos con los criterios de busqueda."
      />

      <ProductoCrearDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
