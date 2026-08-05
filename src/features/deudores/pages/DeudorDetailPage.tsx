import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { RegistrarAbonoDialog } from "@/features/deudores/components/RegistrarAbonoDialog";
import { useAbonos, useDeudor, useHistorialDeudor } from "@/features/deudores/hooks/use-deudores";
import type { AbonoResponse, HistorialCuentaPorCobrarResponse } from "@/features/deudores/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EstadoCuentaPorCobrar, MedioPago, PERMISOS, TipoEventoCuentaPorCobrar } from "@/types/enums";

const MEDIO_PAGO_LABEL: Record<MedioPago, string> = {
  EFECTIVO: "Efectivo",
  NEQUI: "Nequi",
  LLAVE: "Llave",
  DAVIPLATA: "Daviplata",
  BANCOLOMBIA: "Bancolombia",
};

const ESTADO_LABEL: Record<EstadoCuentaPorCobrar, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Parcial",
  PAGADA: "Pagada",
  ANULADA: "Anulada",
};

const ESTADO_TONE: Record<EstadoCuentaPorCobrar, "success" | "warning" | "destructive" | "muted" | "primary"> = {
  PENDIENTE: "warning",
  PARCIAL: "primary",
  PAGADA: "success",
  ANULADA: "muted",
};

const TIPO_EVENTO_LABEL: Record<TipoEventoCuentaPorCobrar, string> = {
  CREACION: "Creacion",
  ABONO: "Abono",
  PAGO_TOTAL: "Pago total",
  ANULACION: "Anulacion",
};

const TIPO_EVENTO_TONE: Record<TipoEventoCuentaPorCobrar, "success" | "warning" | "destructive" | "muted" | "primary"> = {
  CREACION: "primary",
  ABONO: "success",
  PAGO_TOTAL: "success",
  ANULACION: "destructive",
};

function DatosTab({ cuentaId }: { cuentaId: number }) {
  const { data: cuenta } = useDeudor(cuentaId);
  const { puede } = usePermiso();

  if (!cuenta) return null;

  const puedeAbonar =
    puede(PERMISOS.DEUDOR_ABONAR) && (cuenta.estado === "PENDIENTE" || cuenta.estado === "PARCIAL");
  const documentoTexto = puede(PERMISOS.CLIENTE_VER_DOCUMENTO)
    ? (cuenta.clienteNumeroDocumento ?? "-")
    : "(oculto)";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Datos de la cuenta</CardTitle>
          {puedeAbonar && <RegistrarAbonoDialog cuentaId={cuenta.id} saldoPendiente={cuenta.saldoPendiente} />}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="text-sm font-medium">
              {cuenta.clienteNombre} · {documentoTexto}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Numero de factura</p>
            <p className="text-sm font-medium">{cuenta.numeroFactura}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monto original</p>
            <p className="text-sm font-medium">{formatCurrency(cuenta.montoOriginal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saldo pendiente</p>
            <p className={cn("text-sm", cuenta.saldoPendiente > 0 && "font-semibold")}>
              {formatCurrency(cuenta.saldoPendiente)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <StatusBadge label={ESTADO_LABEL[cuenta.estado]} tone={ESTADO_TONE[cuenta.estado]} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha</p>
            <p className="text-sm font-medium">{formatDateTime(cuenta.fecha)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha ultimo abono</p>
            <p className="text-sm font-medium">{formatDateTime(cuenta.fechaUltimoAbono)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha anulacion</p>
            <p className="text-sm font-medium">{formatDateTime(cuenta.fechaAnulacion)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AbonosTab({ cuentaId }: { cuentaId: number }) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAbonos(cuentaId, { page, size: 10 });

  const columns: ColumnDef<AbonoResponse, any>[] = [
    { accessorKey: "monto", header: "Monto", cell: ({ row }) => formatCurrency(row.original.monto) },
    {
      accessorKey: "medioPago",
      header: "Medio de pago",
      cell: ({ row }) => MEDIO_PAGO_LABEL[row.original.medioPago],
    },
    { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => formatDateTime(row.original.fecha) },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.contenido ?? []}
      isLoading={isLoading}
      page={data}
      onPageChange={setPage}
      emptyTitle="Sin abonos"
      emptyDescription="Todavia no se han registrado abonos para esta cuenta."
    />
  );
}

function HistorialTab({ cuentaId }: { cuentaId: number }) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useHistorialDeudor(cuentaId, { page, size: 10 });

  const columns: ColumnDef<HistorialCuentaPorCobrarResponse, any>[] = [
    {
      accessorKey: "tipoEvento",
      header: "Evento",
      cell: ({ row }) => (
        <StatusBadge
          label={TIPO_EVENTO_LABEL[row.original.tipoEvento]}
          tone={TIPO_EVENTO_TONE[row.original.tipoEvento]}
        />
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
      emptyDescription="Todavia no hay eventos registrados para esta cuenta."
    />
  );
}

export function DeudorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cuentaId = Number(id);
  const { data: cuenta, isLoading } = useDeudor(cuentaId);
  const { puede } = usePermiso();

  if (isLoading || !cuenta) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const documentoTexto = puede(PERMISOS.CLIENTE_VER_DOCUMENTO)
    ? (cuenta.clienteNumeroDocumento ?? "-")
    : "(oculto)";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Cuenta ${cuenta.numeroFactura}`}
        description={`${cuenta.clienteNombre} · ${documentoTexto}`}
        actions={
          <Button variant="outline" onClick={() => navigate("/deudores")}>
            <ArrowLeft className="size-4" />
            Volver
          </Button>
        }
      />

      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="abonos">Abonos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="datos" className="mt-4">
          <DatosTab cuentaId={cuentaId} />
        </TabsContent>
        <TabsContent value="abonos" className="mt-4">
          <AbonosTab cuentaId={cuentaId} />
        </TabsContent>
        <TabsContent value="historial" className="mt-4">
          <HistorialTab cuentaId={cuentaId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
