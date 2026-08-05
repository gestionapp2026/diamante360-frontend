import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import { Combobox } from "@/components/common/Combobox";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clienteApi } from "@/features/clientes/api/cliente-api";
import { useDeudores } from "@/features/deudores/hooks/use-deudores";
import type { CuentaPorCobrarResponse } from "@/features/deudores/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EstadoCuentaPorCobrar, PERMISOS } from "@/types/enums";

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

export function DeudoresListPage() {
  const navigate = useNavigate();
  const { puede } = usePermiso();

  const [estado, setEstado] = useState<EstadoCuentaPorCobrar | "TODOS">("TODOS");
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteTexto, setClienteTexto] = useState("");
  const [debouncedClienteTexto, setDebouncedClienteTexto] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedClienteTexto(clienteTexto);
    }, 400);
    return () => clearTimeout(timeout);
  }, [clienteTexto]);

  const { data: clientesData, isLoading: isLoadingClientes } = useQuery({
    queryKey: ["clientes", "combobox", debouncedClienteTexto],
    queryFn: () => clienteApi.listar({ texto: debouncedClienteTexto, page: 0, size: 20 }),
  });

  const clienteOptions =
    clientesData?.contenido.map((cliente) => ({
      value: String(cliente.id),
      label: cliente.nombre,
      description: puede(PERMISOS.CLIENTE_VER_DOCUMENTO) ? (cliente.numeroDocumento ?? undefined) : "(oculto)",
    })) ?? [];

  const { data, isLoading } = useDeudores({
    clienteId: clienteId ? Number(clienteId) : undefined,
    estado: estado === "TODOS" ? undefined : estado,
    page,
    size: 10,
  });

  const columns: ColumnDef<CuentaPorCobrarResponse, any>[] = useMemo(() => [
    { accessorKey: "numeroFactura", header: "Numero" },
    { accessorKey: "clienteNombre", header: "Cliente" },
    {
      accessorKey: "montoOriginal",
      header: "Monto original",
      cell: ({ row }) => formatCurrency(row.original.montoOriginal),
    },
    {
      accessorKey: "saldoPendiente",
      header: "Saldo pendiente",
      cell: ({ row }) => (
        <span className={cn(row.original.saldoPendiente > 0 && "font-semibold")}>
          {formatCurrency(row.original.saldoPendiente)}
        </span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <StatusBadge label={ESTADO_LABEL[row.original.estado]} tone={ESTADO_TONE[row.original.estado]} />
      ),
    },
    { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => formatDateTime(row.original.fecha) },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader title="Cuentas por cobrar" description="Consulta las cuentas por cobrar de los clientes y registra abonos." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={estado}
          onValueChange={(value) => {
            setEstado(value as EstadoCuentaPorCobrar | "TODOS");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value={EstadoCuentaPorCobrar.PENDIENTE}>Pendiente</SelectItem>
            <SelectItem value={EstadoCuentaPorCobrar.PARCIAL}>Parcial</SelectItem>
            <SelectItem value={EstadoCuentaPorCobrar.PAGADA}>Pagada</SelectItem>
            <SelectItem value={EstadoCuentaPorCobrar.ANULADA}>Anulada</SelectItem>
          </SelectContent>
        </Select>

        <Combobox
          className="w-full sm:w-64"
          options={clienteOptions}
          value={clienteId}
          onChange={(value) => {
            setClienteId(value);
            setPage(0);
          }}
          onSearchChange={setClienteTexto}
          loading={isLoadingClientes}
          placeholder="Filtrar por cliente..."
          emptyText="Sin clientes"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.contenido ?? []}
        isLoading={isLoading}
        page={data}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/deudores/${row.id}`)}
        emptyTitle="Sin cuentas por cobrar"
        emptyDescription="No se encontraron cuentas por cobrar con los criterios de busqueda."
      />
    </div>
  );
}
