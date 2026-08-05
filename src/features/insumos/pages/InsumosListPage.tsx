import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, FlaskConical } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { activoTone, StatusBadge } from "@/components/common/StatusBadge";
import { CrearInsumoDialog } from "@/features/insumos/components/CrearInsumoDialog";
import { useInsumosQuimicos, useLotesPorVencer } from "@/features/insumos/hooks/use-insumos";
import type { InsumoQuimicoResponse } from "@/features/insumos/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatDate, formatNumber } from "@/lib/format";
import { PERMISOS } from "@/types/enums";

const columns: ColumnDef<InsumoQuimicoResponse, any>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span>,
  },
  {
    accessorKey: "unidadMedida",
    header: "Unidad",
  },
  {
    accessorKey: "stockActual",
    header: "Stock",
    cell: ({ row }) => formatNumber(row.original.stockActual),
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.activo ? "Activo" : "Inactivo"}
        tone={activoTone(row.original.activo)}
      />
    ),
  },
];

export function InsumosListPage() {
  const navigate = useNavigate();
  const { puede } = usePermiso();
  const [page, setPage] = useState(0);

  const insumosQuery = useInsumosQuimicos({ page, size: 10, sort: "nombre,asc" });
  const vencimientosQuery = useLotesPorVencer(30);

  const lotesPorVencer = vencimientosQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insumos quimicos"
        description="Gestiona el inventario de insumos quimicos, sus lotes y movimientos."
        actions={puede(PERMISOS.INSUMO_CREAR) ? <CrearInsumoDialog /> : undefined}
      />

      {lotesPorVencer.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-warning" />
              {lotesPorVencer.length} lote(s) proximos a vencer (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {lotesPorVencer.slice(0, 8).map((lote) => (
              <StatusBadge
                key={lote.id}
                tone="warning"
                label={`Insumo #${lote.insumoId} · ${lote.numeroLote ?? `Lote #${lote.id}`} · vence ${formatDate(
                  lote.fechaVencimiento,
                )}`}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="size-4 text-primary" />
            Listado de insumos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={insumosQuery.data?.contenido ?? []}
            isLoading={insumosQuery.isLoading}
            page={insumosQuery.data}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/insumos-quimicos/${row.id}`)}
            emptyTitle="Sin insumos registrados"
            emptyDescription="Crea el primer insumo quimico para comenzar a gestionar el inventario."
          />
        </CardContent>
      </Card>
    </div>
  );
}
