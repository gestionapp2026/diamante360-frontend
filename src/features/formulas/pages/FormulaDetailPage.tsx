import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { EliminarConDependenciasButton } from "@/components/common/EliminarConDependenciasButton";
import { PageHeader } from "@/components/common/PageHeader";
import { activoTone, StatusBadge } from "@/components/common/StatusBadge";
import { EditarFormulaDialog } from "@/features/formulas/components/EditarFormulaDialog";
import { ProducirFormulaDialog } from "@/features/formulas/components/ProducirFormulaDialog";
import {
  useCambiarEstadoFormula,
  useDependenciasFormula,
  useEliminarFormula,
  useFormula,
} from "@/features/formulas/hooks/use-formulas";
import type { DetalleFormulaResponse } from "@/features/formulas/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatNumber } from "@/lib/format";
import { PERMISOS } from "@/types/enums";

const columns: ColumnDef<DetalleFormulaResponse, any>[] = [
  { accessorKey: "numero", header: "Frasco #" },
  {
    id: "quimico",
    header: "Quimico",
    cell: ({ row }) => row.original.insumoNombre ?? `Quimico #${row.original.numero}`,
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => formatNumber(row.original.cantidad),
  },
  { accessorKey: "unidadMedidaInsumo", header: "Unidad" },
];

export function FormulaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const formulaId = Number(id);
  const { data: formula, isLoading } = useFormula(formulaId);
  const { puede } = usePermiso();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cambiarEstado = useCambiarEstadoFormula(formulaId);
  const eliminarFormula = useEliminarFormula(formulaId);

  if (isLoading || !formula) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={formula.productoNombre}
        description="Detalle de la formula de produccion"
        actions={
          <div className="flex items-center gap-2">
            {puede(PERMISOS.FORMULA_PRODUCIR) && (
              <ProducirFormulaDialog formulaId={formulaId} detalles={formula.detalles} />
            )}
            {puede(PERMISOS.FORMULA_EDITAR) && <EditarFormulaDialog formula={formula} />}
            <Button variant="outline" onClick={() => navigate("/formulas")}>
              <ArrowLeft className="size-4" />
              Volver
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Datos de la formula</CardTitle>
          <div className="flex items-center gap-2">
            {puede(PERMISOS.FORMULA_EDITAR) && (
              <Button
                variant="outline"
                className={formula.activo ? "text-destructive hover:text-destructive" : undefined}
                onClick={() => setConfirmOpen(true)}
              >
                {formula.activo ? "Desactivar" : "Activar"}
              </Button>
            )}
            {puede(PERMISOS.FORMULA_ELIMINAR) && (
              <EliminarConDependenciasButton
                entidadLabel={`formula de "${formula.productoNombre}"`}
                useDependencias={useDependenciasFormula}
                id={formulaId}
                eliminarPending={eliminarFormula.isPending}
                onConfirmar={(cascada) => eliminarFormula.mutate(cascada, { onSuccess: () => navigate("/formulas") })}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Producto</p>
            <p className="text-sm font-medium">{formula.productoNombre}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cantidad base</p>
            <p className="text-sm font-medium">
              {formatNumber(formula.cantidadBase)} {formula.unidadBase}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <StatusBadge label={formula.activo ? "Activa" : "Inactiva"} tone={activoTone(formula.activo)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quimicos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={formula.detalles}
            emptyTitle="Sin quimicos"
            emptyDescription="Esta formula no tiene quimicos registrados."
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={formula.activo ? "Desactivar formula" : "Activar formula"}
        description={
          formula.activo
            ? `Esta seguro de desactivar la formula de "${formula.productoNombre}"?`
            : `Esta seguro de activar la formula de "${formula.productoNombre}"?`
        }
        confirmLabel={formula.activo ? "Desactivar" : "Activar"}
        destructive={formula.activo}
        loading={cambiarEstado.isPending}
        onConfirm={() =>
          cambiarEstado.mutate({ activo: !formula.activo }, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </div>
  );
}
