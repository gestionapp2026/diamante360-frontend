import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { EliminarConDependenciasButton } from "@/components/common/EliminarConDependenciasButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, activoTone } from "@/components/common/StatusBadge";
import { CategoriaFormDialog } from "@/features/productos/components/CategoriaFormDialog";
import { EditarCategoriaDialog } from "@/features/productos/components/EditarCategoriaDialog";
import {
  useCambiarEstadoCategoria,
  useCategorias,
  useDependenciasCategoria,
  useEliminarCategoria,
} from "@/features/productos/hooks/use-categorias";
import type { CategoriaResponse } from "@/features/productos/types";
import { usePermiso } from "@/hooks/use-permiso";
import { PERMISOS } from "@/types/enums";

function AccionesCell({ categoria }: { categoria: CategoriaResponse }) {
  const { puede } = usePermiso();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cambiarEstado = useCambiarEstadoCategoria(categoria.id);
  const eliminarCategoria = useEliminarCategoria(categoria.id);

  return (
    <div className="flex items-center justify-end gap-2">
      {puede(PERMISOS.PRODUCTO_EDITAR) && <EditarCategoriaDialog categoria={categoria} />}
      {puede(PERMISOS.PRODUCTO_ELIMINAR) && (
        <Button
          variant="outline"
          size="sm"
          className={categoria.activo ? "text-destructive hover:text-destructive" : undefined}
          onClick={() => setConfirmOpen(true)}
        >
          {categoria.activo ? "Desactivar" : "Activar"}
        </Button>
      )}
      {puede(PERMISOS.PRODUCTO_ELIMINAR) && (
        <EliminarConDependenciasButton
          entidadLabel={`categoria "${categoria.nombre}"`}
          useDependencias={useDependenciasCategoria}
          id={categoria.id}
          eliminarPending={eliminarCategoria.isPending}
          onConfirmar={(cascada) => eliminarCategoria.mutate(cascada, { onSuccess: () => {} })}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={categoria.activo ? "Desactivar categoria" : "Activar categoria"}
        description={
          categoria.activo
            ? `Esta seguro de desactivar "${categoria.nombre}"?`
            : `Esta seguro de activar "${categoria.nombre}"?`
        }
        confirmLabel={categoria.activo ? "Desactivar" : "Activar"}
        destructive={categoria.activo}
        loading={cambiarEstado.isPending}
        onConfirm={() =>
          cambiarEstado.mutate({ activo: !categoria.activo }, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </div>
  );
}

export function CategoriasListPage() {
  const { puede } = usePermiso();
  const { data: categorias, isLoading } = useCategorias();

  const columns: ColumnDef<CategoriaResponse, any>[] = useMemo(() => [
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "descripcion", header: "Descripcion", cell: ({ row }) => row.original.descripcion ?? "-" },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <StatusBadge label={row.original.activo ? "Activo" : "Inactivo"} tone={activoTone(row.original.activo)} />
      ),
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => <AccionesCell categoria={row.original} />,
    },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Gestiona las categorias del catalogo de productos."
        actions={puede(PERMISOS.PRODUCTO_CREAR) && <CategoriaFormDialog />}
      />

      <DataTable
        columns={columns}
        data={categorias ?? []}
        isLoading={isLoading}
        emptyTitle="Sin categorias"
        emptyDescription="Crea la primera categoria para comenzar a organizar los productos."
      />
    </div>
  );
}
