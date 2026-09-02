import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge, activoTone } from "@/components/common/StatusBadge";
import { useClientesPorRuta } from "@/features/clientes/hooks/use-rutas";
import type { ClienteResponse } from "@/features/clientes/types";
import type { RutaResponse } from "@/features/clientes/types";
import { usePermiso } from "@/hooks/use-permiso";
import { PERMISOS } from "@/types/enums";

interface RutaClientesDialogProps {
  ruta: RutaResponse;
}

export function RutaClientesDialog({ ruta }: RutaClientesDialogProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const { puede } = usePermiso();

  const { data, isLoading } = useClientesPorRuta(open ? ruta.id : undefined, { page, size: 10 });

  const columns: ColumnDef<ClienteResponse, any>[] = [
    {
      accessorKey: "numeroDocumento",
      header: "Documento",
      cell: ({ row }) =>
        `${row.original.tipoDocumento} ${
          puede(PERMISOS.CLIENTE_VER_DOCUMENTO) ? (row.original.numeroDocumento ?? "-") : "(oculto)"
        }`,
    },
    { accessorKey: "nombre", header: "Nombre" },
    {
      accessorKey: "telefonos",
      header: "Telefono",
      cell: ({ row }) => (row.original.telefonos.length > 0 ? row.original.telefonos.join(", ") : "-"),
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <StatusBadge label={row.original.activo ? "Activo" : "Inactivo"} tone={activoTone(row.original.activo)} />
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="size-4" />
          Clientes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Clientes de la ruta {ruta.nombre}</DialogTitle>
          <DialogDescription>Listado de clientes asignados a esta ruta.</DialogDescription>
        </DialogHeader>
        <DataTable
          columns={columns}
          data={data?.contenido ?? []}
          isLoading={isLoading}
          page={data}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/clientes/${row.id}`)}
          emptyTitle="Sin clientes"
          emptyDescription="Esta ruta todavia no tiene clientes asignados."
        />
      </DialogContent>
    </Dialog>
  );
}
