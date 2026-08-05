import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/common/DataTable";
import { EliminarConDependenciasButton } from "@/components/common/EliminarConDependenciasButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, activoTone } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RutaFormDialog } from "@/features/clientes/components/RutaFormDialog";
import { RutaClientesDialog } from "@/features/clientes/components/RutaClientesDialog";
import {
  useCambiarEstadoRuta,
  useDependenciasRuta,
  useEliminarRuta,
  useRutas,
} from "@/features/clientes/hooks/use-rutas";
import type { RutaResponse } from "@/features/clientes/types";
import { usePermiso } from "@/hooks/use-permiso";
import { PERMISOS } from "@/types/enums";

function CambiarEstadoRutaAction({ ruta }: { ruta: RutaResponse }) {
  const [open, setOpen] = useState(false);
  const cambiarEstado = useCambiarEstadoRuta(ruta.id);

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={ruta.activo ? "Desactivar ruta" : "Activar ruta"}
        description={
          ruta.activo
            ? `Esta seguro de desactivar la ruta "${ruta.nombre}"?`
            : `Esta seguro de activar la ruta "${ruta.nombre}"?`
        }
        confirmLabel={ruta.activo ? "Desactivar" : "Activar"}
        destructive={ruta.activo}
        loading={cambiarEstado.isPending}
        onConfirm={() =>
          cambiarEstado.mutate(
            { activo: !ruta.activo },
            {
              onSuccess: () => setOpen(false),
            },
          )
        }
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="text-sm font-medium text-primary hover:underline"
      >
        {ruta.activo ? "Desactivar" : "Activar"}
      </button>
    </>
  );
}

function EliminarRutaAction({ ruta }: { ruta: RutaResponse }) {
  const eliminarRuta = useEliminarRuta(ruta.id);
  return (
    <EliminarConDependenciasButton
      entidadLabel={`ruta "${ruta.nombre}"`}
      useDependencias={useDependenciasRuta}
      id={ruta.id}
      eliminarPending={eliminarRuta.isPending}
      onConfirmar={(cascada) => eliminarRuta.mutate(cascada)}
    />
  );
}

export function RutasListPage() {
  const { puede } = usePermiso();
  const { data, isLoading } = useRutas();

  const columns: ColumnDef<RutaResponse, any>[] = useMemo(() => [
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "descripcion", header: "Descripcion", cell: ({ row }) => row.original.descripcion ?? "-" },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <StatusBadge label={row.original.activo ? "Activa" : "Inactiva"} tone={activoTone(row.original.activo)} />
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <RutaClientesDialog ruta={row.original} />
          {puede(PERMISOS.CLIENTE_EDITAR) && <RutaFormDialog ruta={row.original} />}
          {puede(PERMISOS.CLIENTE_ELIMINAR) && <CambiarEstadoRutaAction ruta={row.original} />}
          {puede(PERMISOS.CLIENTE_ELIMINAR) && <EliminarRutaAction ruta={row.original} />}
        </div>
      ),
    },
  ], [puede]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rutas"
        description="Gestiona las rutas de reparto asignables a clientes."
        actions={puede(PERMISOS.CLIENTE_CREAR) && <RutaFormDialog />}
      />

      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        emptyTitle="Sin rutas"
        emptyDescription="Todavia no se han creado rutas de reparto."
      />
    </div>
  );
}
