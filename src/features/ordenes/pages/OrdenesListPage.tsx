import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/common/Combobox";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useClientes } from "@/features/clientes/hooks/use-clientes";
import { useOrdenes } from "@/features/ordenes/hooks/use-ordenes";
import type { OrdenResponse } from "@/features/ordenes/types";
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

export function OrdenesListPage() {
  const navigate = useNavigate();
  const { puede } = usePermiso();

  const [estado, setEstado] = useState<EstadoOrden | "todas">("todas");
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteTexto, setClienteTexto] = useState("");
  const [debouncedClienteTexto, setDebouncedClienteTexto] = useState("");
  const [fechaEntregaDesde, setFechaEntregaDesde] = useState("");
  const [fechaEntregaHasta, setFechaEntregaHasta] = useState("");
  const [fechaCreacionDesde, setFechaCreacionDesde] = useState("");
  const [fechaCreacionHasta, setFechaCreacionHasta] = useState("");
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

  const { data, isLoading } = useOrdenes({
    clienteId: clienteId ? Number(clienteId) : undefined,
    estado: estado === "todas" ? undefined : estado,
    fechaEntregaDesde: fechaEntregaDesde || undefined,
    fechaEntregaHasta: fechaEntregaHasta || undefined,
    fechaCreacionDesde: fechaCreacionDesde || undefined,
    fechaCreacionHasta: fechaCreacionHasta || undefined,
    page,
    size: 10,
  });

  function limpiarFiltros() {
    setEstado("todas");
    setClienteId(null);
    setClienteTexto("");
    setFechaEntregaDesde("");
    setFechaEntregaHasta("");
    setFechaCreacionDesde("");
    setFechaCreacionHasta("");
    setPage(0);
  }

  const columns: ColumnDef<OrdenResponse, any>[] = useMemo(
    () => [
      { accessorKey: "numero", header: "Numero" },
      { accessorKey: "clienteNombre", header: "Cliente" },
      {
        accessorKey: "fechaEntrega",
        header: "Fecha de entrega",
        cell: ({ row }) => formatDate(row.original.fechaEntrega),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
          <StatusBadge label={ESTADO_ORDEN_LABEL[row.original.estado]} tone={ordenEstadoTone(row.original.estado)} />
        ),
      },
      {
        accessorKey: "fechaCreacion",
        header: "Fecha de creacion",
        cell: ({ row }) => formatDateTime(row.original.fechaCreacion),
      },
      { accessorKey: "usuarioNombre", header: "Registrada por" },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordenes"
        description="Consulta y gestiona las ordenes anticipadas registradas para los clientes."
        actions={
          puede(PERMISOS.ORDEN_CREAR) && (
            <Button onClick={() => navigate("/ordenes/nueva")}>
              <Plus className="size-4" />
              Nueva orden
            </Button>
          )
        }
      />

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Cliente</p>
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
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Estado</p>
            <Select
              value={estado}
              onValueChange={(value) => {
                setEstado(value as EstadoOrden | "todas");
                setPage(0);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value={EstadoOrden.PENDIENTE}>Pendiente</SelectItem>
                <SelectItem value={EstadoOrden.DESPACHADA}>Despachada</SelectItem>
                <SelectItem value={EstadoOrden.ANULADA}>Anulada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Fecha de entrega desde</p>
            <Input
              type="date"
              value={fechaEntregaDesde}
              onChange={(e) => {
                setFechaEntregaDesde(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Fecha de entrega hasta</p>
            <Input
              type="date"
              value={fechaEntregaHasta}
              onChange={(e) => {
                setFechaEntregaHasta(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div />
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Fecha de creacion desde</p>
            <Input
              type="date"
              value={fechaCreacionDesde}
              onChange={(e) => {
                setFechaCreacionDesde(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Fecha de creacion hasta</p>
            <Input
              type="date"
              value={fechaCreacionHasta}
              onChange={(e) => {
                setFechaCreacionHasta(e.target.value);
                setPage(0);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={data?.contenido ?? []}
        isLoading={isLoading}
        page={data}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/ordenes/${row.id}`)}
        emptyTitle="Sin ordenes"
        emptyDescription="No se encontraron ordenes con los criterios de busqueda."
      />
    </div>
  );
}
