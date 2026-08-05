import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { EliminarConDependenciasButton } from "@/components/common/EliminarConDependenciasButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  useAnularOrden,
  useDependenciasOrden,
  useDespacharOrden,
  useEliminarOrden,
  useOrden,
} from "@/features/ordenes/hooks/use-ordenes";
import type { DetalleOrdenResponse } from "@/features/ordenes/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatDate, formatDateTime } from "@/lib/format";
import { EstadoOrden, PERMISOS } from "@/types/enums";

const ESTADO_ORDEN_LABEL: Record<EstadoOrden, string> = {
  PENDIENTE: "Pendiente",
  DESPACHADA: "Despachada",
  ANULADA: "Anulada",
};

function ordenEstadoTone(estado: EstadoOrden): "success" | "warning" | "destructive" | "muted" | "primary" {
  if (estado === EstadoOrden.DESPACHADA) return "success";
  if (estado === EstadoOrden.ANULADA) return "destructive";
  return "warning";
}

export function OrdenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ordenId = Number(id);
  const { data: orden, isLoading } = useOrden(ordenId);
  const { puede } = usePermiso();
  const [confirmDespacharOpen, setConfirmDespacharOpen] = useState(false);
  const [confirmAnularOpen, setConfirmAnularOpen] = useState(false);
  const despacharOrden = useDespacharOrden(ordenId);
  const anularOrden = useAnularOrden(ordenId);
  const eliminarOrden = useEliminarOrden(ordenId);

  if (isLoading || !orden) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const columns: ColumnDef<DetalleOrdenResponse, any>[] = [
    { accessorKey: "productoNombre", header: "Producto" },
    { accessorKey: "cantidad", header: "Cantidad" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Orden ${orden.numero}`}
        description={orden.clienteNombre}
        actions={
          <div className="flex items-center gap-2">
            {puede(PERMISOS.ORDEN_DESPACHAR) && orden.estado === EstadoOrden.PENDIENTE && (
              <Button onClick={() => setConfirmDespacharOpen(true)}>Despachar</Button>
            )}
            {puede(PERMISOS.ORDEN_ANULAR) && orden.estado === EstadoOrden.PENDIENTE && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmAnularOpen(true)}
              >
                Anular
              </Button>
            )}
            {puede(PERMISOS.ORDEN_ELIMINAR) && orden.estado !== EstadoOrden.PENDIENTE && (
              <EliminarConDependenciasButton
                entidadLabel={`orden "${orden.numero}"`}
                useDependencias={useDependenciasOrden}
                id={ordenId}
                eliminarPending={eliminarOrden.isPending}
                onConfirmar={(cascada) => eliminarOrden.mutate(cascada, { onSuccess: () => navigate("/ordenes") })}
              />
            )}
            <Button variant="outline" onClick={() => navigate("/ordenes")}>
              <ArrowLeft className="size-4" />
              Volver
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="text-sm font-medium">{orden.clienteNombre}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <StatusBadge label={ESTADO_ORDEN_LABEL[orden.estado]} tone={ordenEstadoTone(orden.estado)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha de entrega</p>
            <p className="text-sm font-medium">{formatDate(orden.fechaEntrega)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha de creacion</p>
            <p className="text-sm font-medium">{formatDateTime(orden.fechaCreacion)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Registrada por</p>
            <p className="text-sm font-medium">{orden.usuarioNombre}</p>
          </div>
          {orden.fechaDespacho && (
            <div>
              <p className="text-xs text-muted-foreground">Fecha de despacho</p>
              <p className="text-sm font-medium">{formatDateTime(orden.fechaDespacho)}</p>
            </div>
          )}
          {orden.fechaAnulacion && (
            <div>
              <p className="text-xs text-muted-foreground">Fecha de anulacion</p>
              <p className="text-sm font-medium">{formatDateTime(orden.fechaAnulacion)}</p>
            </div>
          )}
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs text-muted-foreground">Observaciones</p>
            <p className="text-sm font-medium">{orden.observaciones ?? "Sin observaciones"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={orden.detalles}
            emptyTitle="Sin items"
            emptyDescription="Esta orden no tiene items registrados."
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDespacharOpen}
        onOpenChange={setConfirmDespacharOpen}
        title="Despachar orden"
        description={`Esta seguro de marcar la orden "${orden.numero}" como despachada?`}
        confirmLabel="Despachar"
        loading={despacharOrden.isPending}
        onConfirm={() => despacharOrden.mutate(undefined, { onSuccess: () => setConfirmDespacharOpen(false) })}
      />

      <ConfirmDialog
        open={confirmAnularOpen}
        onOpenChange={setConfirmAnularOpen}
        title="Anular orden"
        description={`Esta seguro de anular la orden "${orden.numero}"? Esta accion no se puede deshacer.`}
        confirmLabel="Anular"
        destructive
        loading={anularOrden.isPending}
        onConfirm={() => anularOrden.mutate(undefined, { onSuccess: () => setConfirmAnularOpen(false) })}
      />
    </div>
  );
}
