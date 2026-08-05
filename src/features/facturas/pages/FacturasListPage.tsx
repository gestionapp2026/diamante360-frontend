import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/common/Combobox";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useClientes } from "@/features/clientes/hooks/use-clientes";
import { useFacturas } from "@/features/facturas/hooks/use-facturas";
import type { FacturaResponse } from "@/features/facturas/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { EstadoFactura, PERMISOS, TipoPago } from "@/types/enums";

const TIPO_PAGO_LABEL: Record<TipoPago, string> = {
  CONTADO: "Contado",
  CREDITO: "Credito",
};

function facturaEstadoTone(estado: EstadoFactura) {
  return estado === EstadoFactura.EMITIDA ? "success" : "muted";
}

export function FacturasListPage() {
  const navigate = useNavigate();
  const { puede } = usePermiso();

  const [estado, setEstado] = useState<EstadoFactura | "todas">("todas");
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteTexto, setClienteTexto] = useState("");
  const [debouncedClienteTexto, setDebouncedClienteTexto] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedClienteTexto(clienteTexto), 400);
    return () => clearTimeout(timeout);
  }, [clienteTexto]);

  const { data: clientesData, isFetching: clientesLoading } = useClientes({
    texto: debouncedClienteTexto,
    page: 0,
    size: 20,
  });

  const clienteOptions =
    clientesData?.contenido.map((c) => ({
      value: String(c.id),
      label: c.nombre,
      description: puede(PERMISOS.CLIENTE_VER_DOCUMENTO) ? (c.numeroDocumento ?? undefined) : "(oculto)",
    })) ?? [];

  const { data, isLoading } = useFacturas({
    clienteId: clienteId ? Number(clienteId) : undefined,
    estado: estado === "todas" ? undefined : estado,
    page,
    size: 10,
  });

  const columns: ColumnDef<FacturaResponse, any>[] = useMemo(() => [
    { accessorKey: "numero", header: "Numero" },
    { accessorKey: "clienteNombre", header: "Cliente" },
    {
      accessorKey: "tipoPago",
      header: "Tipo de pago",
      cell: ({ row }) => TIPO_PAGO_LABEL[row.original.tipoPago],
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => formatCurrency(row.original.total),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <StatusBadge
          label={row.original.estado === EstadoFactura.EMITIDA ? "Emitida" : "Anulada"}
          tone={facturaEstadoTone(row.original.estado)}
        />
      ),
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => formatDateTime(row.original.fecha),
    },
    { accessorKey: "usuarioNombre", header: "Emitida por" },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facturas"
        description="Consulta y gestiona las facturas emitidas a los clientes."
        actions={
          puede(PERMISOS.FACTURA_CREAR) && (
            <Button onClick={() => navigate("/facturas/nueva")}>
              <Plus className="size-4" />
              Nueva factura
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="w-full max-w-xs">
          <Select
            value={estado}
            onValueChange={(value) => {
              setEstado(value as EstadoFactura | "todas");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value={EstadoFactura.EMITIDA}>Emitida</SelectItem>
              <SelectItem value={EstadoFactura.ANULADA}>Anulada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full max-w-xs">
          <Combobox
            options={clienteOptions}
            value={clienteId}
            onChange={(value) => {
              setClienteId(value);
              setPage(0);
            }}
            onSearchChange={setClienteTexto}
            loading={clientesLoading}
            placeholder="Todos los clientes"
            emptyText="Sin clientes"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.contenido ?? []}
        isLoading={isLoading}
        page={data}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/facturas/${row.id}`)}
        emptyTitle="Sin facturas"
        emptyDescription="No se encontraron facturas con los criterios de busqueda."
      />
    </div>
  );
}
