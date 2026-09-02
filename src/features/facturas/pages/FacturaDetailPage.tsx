import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, FileDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { EliminarConDependenciasButton } from "@/components/common/EliminarConDependenciasButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  useAnularFactura,
  useDependenciasFactura,
  useDescargarFacturaPdf,
  useEliminarFactura,
  useFactura,
  useHistorialFactura,
} from "@/features/facturas/hooks/use-facturas";
import type { DetalleFacturaResponse, HistorialFacturaResponse } from "@/features/facturas/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { EstadoFactura, MedioPago, PERMISOS, TipoEventoFactura, TipoPago } from "@/types/enums";

const TIPO_PAGO_LABEL: Record<TipoPago, string> = {
  CONTADO: "Contado",
  CREDITO: "Credito",
};

const MEDIO_PAGO_LABEL: Record<MedioPago, string> = {
  EFECTIVO: "Efectivo",
  NEQUI: "Nequi",
  LLAVE: "Llave",
  DAVIPLATA: "Daviplata",
  BANCOLOMBIA: "Bancolombia",
};

const TIPO_EVENTO_LABEL: Record<TipoEventoFactura, string> = {
  CREACION: "Creacion",
  ANULACION: "Anulacion",
};

const TIPO_EVENTO_TONE: Record<TipoEventoFactura, "success" | "warning" | "destructive" | "muted" | "primary"> = {
  CREACION: "primary",
  ANULACION: "destructive",
};

function DetalleTab({ facturaId }: { facturaId: number }) {
  const { data: factura } = useFactura(facturaId);
  if (!factura) return null;

  const columns: ColumnDef<DetalleFacturaResponse, any>[] = [
    { accessorKey: "productoNombre", header: "Producto" },
    { accessorKey: "cantidad", header: "Cantidad" },
    {
      accessorKey: "precioUnitario",
      header: "Precio unitario",
      cell: ({ row }) => formatCurrency(row.original.precioUnitario),
    },
    {
      accessorKey: "porcentajeDescuento",
      header: "% Descuento",
      cell: ({ row }) => `${row.original.porcentajeDescuento}%`,
    },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }) => formatCurrency(row.original.subtotal),
    },
    {
      accessorKey: "descuento",
      header: "Descuento",
      cell: ({ row }) => formatCurrency(row.original.descuento),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => formatCurrency(row.original.total),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={factura.detalles}
        emptyTitle="Sin items"
        emptyDescription="Esta factura no tiene items registrados."
      />
      <div className="ml-auto flex max-w-xs flex-col gap-1 rounded-lg border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(factura.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Descuento</span>
          <span>{formatCurrency(factura.descuento)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(factura.total)}</span>
        </div>
      </div>
    </div>
  );
}

function HistorialTab({ facturaId }: { facturaId: number }) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useHistorialFactura(facturaId, { page, size: 10 });

  const columns: ColumnDef<HistorialFacturaResponse, any>[] = [
    {
      accessorKey: "tipoEvento",
      header: "Evento",
      cell: ({ row }) => (
        <StatusBadge label={TIPO_EVENTO_LABEL[row.original.tipoEvento]} tone={TIPO_EVENTO_TONE[row.original.tipoEvento]} />
      ),
    },
    { accessorKey: "descripcion", header: "Descripcion", cell: ({ row }) => row.original.descripcion ?? "-" },
    { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => formatDateTime(row.original.fecha) },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.contenido ?? []}
      isLoading={isLoading}
      page={data}
      onPageChange={setPage}
      emptyTitle="Sin historial"
      emptyDescription="Todavia no hay eventos registrados para esta factura."
    />
  );
}

export function FacturaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const facturaId = Number(id);
  const { data: factura, isLoading } = useFactura(facturaId);
  const { puede } = usePermiso();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const anularFactura = useAnularFactura(facturaId);
  const eliminarFactura = useEliminarFactura(facturaId);
  const descargarPdf = useDescargarFacturaPdf();

  if (isLoading || !factura) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const documentoTexto = puede(PERMISOS.CLIENTE_VER_DOCUMENTO)
    ? (factura.clienteNumeroDocumento ?? "-")
    : "(oculto)";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Factura ${factura.numero}`}
        description={`${factura.clienteNombre} · ${documentoTexto}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={descargarPdf.isPending}
              onClick={() => descargarPdf.mutate({ id: facturaId, numero: factura.numero })}
            >
              {descargarPdf.isPending ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
              Descargar PDF
            </Button>
            {puede(PERMISOS.FACTURA_ANULAR) && factura.estado === EstadoFactura.EMITIDA && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                Anular factura
              </Button>
            )}
            {puede(PERMISOS.FACTURA_ELIMINAR) && factura.estado === EstadoFactura.ANULADA && (
              <EliminarConDependenciasButton
                entidadLabel={`factura "${factura.numero}"`}
                useDependencias={useDependenciasFactura}
                id={facturaId}
                eliminarPending={eliminarFactura.isPending}
                onConfirmar={(cascada) => eliminarFactura.mutate(cascada, { onSuccess: () => navigate("/facturas") })}
              />
            )}
            <Button variant="outline" onClick={() => navigate("/facturas")}>
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
            <p className="text-sm font-medium">
              {factura.clienteNombre} · {documentoTexto}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo de pago</p>
            <p className="text-sm font-medium">{TIPO_PAGO_LABEL[factura.tipoPago]}</p>
          </div>
          {factura.medioPago && (
            <div>
              <p className="text-xs text-muted-foreground">Medio de pago</p>
              <p className="text-sm font-medium">{MEDIO_PAGO_LABEL[factura.medioPago]}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <StatusBadge
              label={factura.estado === EstadoFactura.EMITIDA ? "Emitida" : "Anulada"}
              tone={factura.estado === EstadoFactura.EMITIDA ? "success" : "muted"}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha</p>
            <p className="text-sm font-medium">{formatDateTime(factura.fecha)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Emitida por</p>
            <p className="text-sm font-medium">{factura.usuarioNombre}</p>
          </div>
          {factura.fechaAnulacion && (
            <div>
              <p className="text-xs text-muted-foreground">Fecha de anulacion</p>
              <p className="text-sm font-medium">{formatDateTime(factura.fechaAnulacion)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="detalle">
        <TabsList>
          <TabsTrigger value="detalle">Detalle</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="detalle" className="mt-4">
          <DetalleTab facturaId={facturaId} />
        </TabsContent>
        <TabsContent value="historial" className="mt-4">
          <HistorialTab facturaId={facturaId} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Anular factura"
        description={`Esta seguro de anular la factura "${factura.numero}"? Esta accion no se puede deshacer.`}
        confirmLabel="Anular"
        destructive
        loading={anularFactura.isPending}
        onConfirm={() => anularFactura.mutate(undefined, { onSuccess: () => setConfirmOpen(false) })}
      />
    </div>
  );
}
