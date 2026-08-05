import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { EliminarConDependenciasButton } from "@/components/common/EliminarConDependenciasButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, activoTone } from "@/components/common/StatusBadge";
import { ActualizarPrecioCompraDialog } from "@/features/insumos/components/ActualizarPrecioCompraDialog";
import { RegistrarEntradaDialog } from "@/features/insumos/components/RegistrarEntradaDialog";
import { RegistrarSalidaDialog } from "@/features/insumos/components/RegistrarSalidaDialog";
import {
  useCambiarEstadoInsumoQuimico,
  useDependenciasInsumoQuimico,
  useEliminarInsumoQuimico,
  useInsumoQuimico,
  useLotesPorInsumo,
  useMovimientosPorInsumo,
} from "@/features/insumos/hooks/use-insumos";
import type { LoteResponse, MovimientoInsumoResponse } from "@/features/insumos/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { PERMISOS } from "@/types/enums";

function DatosTab({ insumoId }: { insumoId: number }) {
  const navigate = useNavigate();
  const { data: insumo } = useInsumoQuimico(insumoId);
  const { puede } = usePermiso();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cambiarEstado = useCambiarEstadoInsumoQuimico(insumoId);
  const eliminarInsumo = useEliminarInsumoQuimico(insumoId);

  if (!insumo) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Datos del insumo</CardTitle>
        <div className="flex items-center gap-2">
          {puede(PERMISOS.INSUMO_ELIMINAR) && (
            <Button
              variant="outline"
              className={insumo.activo ? "text-destructive hover:text-destructive" : undefined}
              onClick={() => setConfirmOpen(true)}
            >
              {insumo.activo ? "Desactivar" : "Activar"}
            </Button>
          )}
          {puede(PERMISOS.INSUMO_ELIMINAR) && (
            <EliminarConDependenciasButton
              entidadLabel={`insumo "${insumo.nombre}"`}
              useDependencias={useDependenciasInsumoQuimico}
              id={insumoId}
              eliminarPending={eliminarInsumo.isPending}
              onConfirmar={(cascada) => eliminarInsumo.mutate(cascada, { onSuccess: () => navigate("/insumos-quimicos") })}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Nombre</p>
          <p className="text-sm font-medium">{insumo.nombre}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Unidad de medida</p>
          <p className="text-sm font-medium">{insumo.unidadMedida}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Stock actual</p>
          <p className="text-sm font-medium">{formatNumber(insumo.stockActual)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Precio de compra</p>
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium">
              {insumo.precioCompra != null ? formatCurrency(insumo.precioCompra) : "-"}
            </p>
            {puede(PERMISOS.INSUMO_CREAR) && (
              <ActualizarPrecioCompraDialog insumoId={insumoId} precioCompraActual={insumo.precioCompra} />
            )}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Estado</p>
          <StatusBadge label={insumo.activo ? "Activo" : "Inactivo"} tone={activoTone(insumo.activo)} />
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={insumo.activo ? "Desactivar insumo" : "Activar insumo"}
        description={
          insumo.activo
            ? `Esta seguro de desactivar "${insumo.nombre}"?`
            : `Esta seguro de activar "${insumo.nombre}"?`
        }
        confirmLabel={insumo.activo ? "Desactivar" : "Activar"}
        destructive={insumo.activo}
        loading={cambiarEstado.isPending}
        onConfirm={() =>
          cambiarEstado.mutate({ activo: !insumo.activo }, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </Card>
  );
}

function LotesTab({ insumoId }: { insumoId: number }) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useLotesPorInsumo(insumoId, { page, size: 10, sort: "fechaVencimiento,asc" });

  const columns: ColumnDef<LoteResponse, any>[] = [
    { accessorKey: "numeroLote", header: "Numero de lote", cell: ({ row }) => row.original.numeroLote ?? "-" },
    {
      accessorKey: "fechaVencimiento",
      header: "Fecha de vencimiento",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {formatDate(row.original.fechaVencimiento)}
          {row.original.vencido && <StatusBadge label="Vencido" tone="destructive" />}
        </div>
      ),
    },
    {
      accessorKey: "cantidadActual",
      header: "Cantidad actual",
      cell: ({ row }) => formatNumber(row.original.cantidadActual),
    },
    {
      accessorKey: "fechaIngreso",
      header: "Fecha de ingreso",
      cell: ({ row }) => formatDate(row.original.fechaIngreso),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.contenido ?? []}
      isLoading={isLoading}
      page={data}
      onPageChange={setPage}
      emptyTitle="Sin lotes"
      emptyDescription="Todavia no se han registrado lotes para este insumo."
    />
  );
}

function MovimientosTab({ insumoId }: { insumoId: number }) {
  const { puede } = usePermiso();
  const [page, setPage] = useState(0);
  const { data, isLoading } = useMovimientosPorInsumo(insumoId, { page, size: 10, sort: "fecha,desc" });

  const columns: ColumnDef<MovimientoInsumoResponse, any>[] = [
    {
      accessorKey: "tipoMovimiento",
      header: "Tipo",
      cell: ({ row }) => (
        <StatusBadge
          label={row.original.tipoMovimiento === "ENTRADA" ? "Entrada" : "Salida"}
          tone={row.original.tipoMovimiento === "ENTRADA" ? "success" : "destructive"}
        />
      ),
    },
    { accessorKey: "cantidad", header: "Cantidad", cell: ({ row }) => formatNumber(row.original.cantidad) },
    {
      accessorKey: "stockResultante",
      header: "Stock resultante",
      cell: ({ row }) => formatNumber(row.original.stockResultante),
    },
    { accessorKey: "motivo", header: "Motivo" },
    { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => formatDateTime(row.original.fecha) },
  ];

  return (
    <div className="space-y-4">
      {puede(PERMISOS.INSUMO_AJUSTAR) && (
        <div className="flex items-center gap-2">
          <RegistrarEntradaDialog insumoId={insumoId} />
          <RegistrarSalidaDialog insumoId={insumoId} />
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.contenido ?? []}
        isLoading={isLoading}
        page={data}
        onPageChange={setPage}
        emptyTitle="Sin movimientos"
        emptyDescription="Todavia no se han registrado movimientos para este insumo."
      />
    </div>
  );
}

export function InsumoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const insumoId = Number(id);
  const { data: insumo, isLoading } = useInsumoQuimico(insumoId);

  if (isLoading || !insumo) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={insumo.nombre}
        description="Detalle del insumo quimico"
        actions={
          <Button variant="outline" onClick={() => navigate("/insumos-quimicos")}>
            <ArrowLeft className="size-4" />
            Volver
          </Button>
        }
      />

      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="lotes">Lotes</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
        </TabsList>
        <TabsContent value="datos" className="mt-4">
          <DatosTab insumoId={insumoId} />
        </TabsContent>
        <TabsContent value="lotes" className="mt-4">
          <LotesTab insumoId={insumoId} />
        </TabsContent>
        <TabsContent value="movimientos" className="mt-4">
          <MovimientosTab insumoId={insumoId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
