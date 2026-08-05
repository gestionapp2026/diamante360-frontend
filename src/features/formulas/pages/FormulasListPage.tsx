import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Beaker, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { activoTone, StatusBadge } from "@/components/common/StatusBadge";
import { useFormulas } from "@/features/formulas/hooks/use-formulas";
import type { FormulaResponse } from "@/features/formulas/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatNumber } from "@/lib/format";
import { PERMISOS } from "@/types/enums";

const columns: ColumnDef<FormulaResponse, any>[] = [
  {
    accessorKey: "productoNombre",
    header: "Producto",
    cell: ({ row }) => <span className="font-medium">{row.original.productoNombre}</span>,
  },
  {
    accessorKey: "cantidadBase",
    header: "Cantidad base",
    cell: ({ row }) => `${formatNumber(row.original.cantidadBase)} ${row.original.unidadBase}`,
  },
  {
    id: "quimicos",
    header: "Quimicos",
    cell: ({ row }) => row.original.detalles.length,
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => (
      <StatusBadge label={row.original.activo ? "Activa" : "Inactiva"} tone={activoTone(row.original.activo)} />
    ),
  },
];

export function FormulasListPage() {
  const navigate = useNavigate();
  const { puede } = usePermiso();
  const [page, setPage] = useState(0);

  const formulasQuery = useFormulas({ page, size: 10, sort: "id,desc" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formulas"
        description="Consulta las formulas de produccion y los quimicos que utiliza cada producto."
        actions={
          puede(PERMISOS.FORMULA_CREAR) ? (
            <Button onClick={() => navigate("/formulas/nueva")}>
              <Plus className="size-4" />
              Nueva formula
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Beaker className="size-4 text-primary" />
            Listado de formulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={formulasQuery.data?.contenido ?? []}
            isLoading={formulasQuery.isLoading}
            page={formulasQuery.data}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/formulas/${row.id}`)}
            emptyTitle="Sin formulas registradas"
            emptyDescription="Crea la primera formula para comenzar a registrar producciones."
          />
        </CardContent>
      </Card>
    </div>
  );
}
