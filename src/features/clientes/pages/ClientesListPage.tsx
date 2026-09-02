import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, activoTone } from "@/components/common/StatusBadge";
import { ClienteFormDialog } from "@/features/clientes/components/ClienteFormDialog";
import { useClientes } from "@/features/clientes/hooks/use-clientes";
import type { ClienteResponse } from "@/features/clientes/types";
import { usePermiso } from "@/hooks/use-permiso";
import { PERMISOS } from "@/types/enums";

export function ClientesListPage() {
  const navigate = useNavigate();
  const { puede } = usePermiso();

  const [texto, setTexto] = useState("");
  const [debouncedTexto, setDebouncedTexto] = useState("");
  const [page, setPage] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedTexto(texto);
      setPage(0);
    }, 400);
    return () => clearTimeout(timeout);
  }, [texto]);

  const sort = sorting[0] ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}` : undefined;
  const { data, isLoading } = useClientes({ texto: debouncedTexto, page, size: 10, sort });

  const columns: ColumnDef<ClienteResponse, any>[] = useMemo(() => [
    {
      accessorKey: "numeroDocumento",
      header: "Documento",
      enableSorting: true,
      cell: ({ row }) =>
        `${row.original.tipoDocumento} ${
          puede(PERMISOS.CLIENTE_VER_DOCUMENTO) ? (row.original.numeroDocumento ?? "-") : "(oculto)"
        }`,
    },
    { accessorKey: "nombre", header: "Nombre", enableSorting: true },
    {
      accessorKey: "telefonos",
      header: "Telefono",
      enableSorting: false,
      cell: ({ row }) => (row.original.telefonos.length > 0 ? row.original.telefonos.join(", ") : "-"),
    },
    {
      accessorKey: "rutaNombre",
      header: "Ruta",
      enableSorting: false,
      cell: ({ row }) => row.original.rutaNombre ?? "Sin ruta",
    },
    {
      accessorKey: "activo",
      header: "Estado",
      enableSorting: false,
      cell: ({ row }) => (
        <StatusBadge label={row.original.activo ? "Activo" : "Inactivo"} tone={activoTone(row.original.activo)} />
      ),
    },
  ], [puede]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gestiona los clientes y su asignacion a rutas de reparto."
        actions={puede(PERMISOS.CLIENTE_CREAR) && <ClienteFormDialog />}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nombre o documento..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.contenido ?? []}
        isLoading={isLoading}
        page={data}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/clientes/${row.id}`)}
        sorting={sorting}
        onSortingChange={(updater) => {
          setSorting(updater);
          setPage(0);
        }}
        emptyTitle="Sin clientes"
        emptyDescription="No se encontraron clientes con los criterios de busqueda."
      />
    </div>
  );
}
