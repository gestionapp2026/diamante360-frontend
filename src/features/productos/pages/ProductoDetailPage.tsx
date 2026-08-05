import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EliminarConDependenciasButton } from "@/components/common/EliminarConDependenciasButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, activoTone } from "@/components/common/StatusBadge";
import { ProductoEditarDialog } from "@/features/productos/components/ProductoEditarDialog";
import {
  useCambiarEstadoProducto,
  useDependenciasProducto,
  useEliminarProducto,
  useProducto,
} from "@/features/productos/hooks/use-productos";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency, formatNumber } from "@/lib/format";
import { PERMISOS } from "@/types/enums";

export function ProductoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productoId = Number(id);
  const { puede } = usePermiso();

  const { data: producto, isLoading } = useProducto(productoId);
  const cambiarEstado = useCambiarEstadoProducto(productoId);
  const eliminarProducto = useEliminarProducto(productoId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !producto) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={producto.nombre}
        description={producto.categoriaNombre}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/productos/${productoId}/movimientos`)}>
              <ClipboardList className="size-4" />
              Ver kardex
            </Button>
            <Button variant="outline" onClick={() => navigate("/productos")}>
              <ArrowLeft className="size-4" />
              Volver
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Datos del producto</CardTitle>
          <div className="flex items-center gap-2">
            {puede(PERMISOS.PRODUCTO_EDITAR) && <ProductoEditarDialog producto={producto} />}
            {puede(PERMISOS.PRODUCTO_ELIMINAR) && (
              <Button
                variant="outline"
                className={producto.activo ? "text-destructive hover:text-destructive" : undefined}
                onClick={() => setConfirmOpen(true)}
              >
                {producto.activo ? "Desactivar" : "Activar"}
              </Button>
            )}
            {puede(PERMISOS.PRODUCTO_ELIMINAR) && (
              <EliminarConDependenciasButton
                entidadLabel={`producto "${producto.nombre}"`}
                useDependencias={useDependenciasProducto}
                id={productoId}
                eliminarPending={eliminarProducto.isPending}
                onConfirmar={(cascada) => eliminarProducto.mutate(cascada, { onSuccess: () => navigate("/productos") })}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Nombre</p>
            <p className="text-sm font-medium">{producto.nombre}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Categoria</p>
            <p className="text-sm font-medium">{producto.categoriaNombre}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo de venta</p>
            <p className="text-sm font-medium">{producto.tipoVenta}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unidad de medida</p>
            <p className="text-sm font-medium">{producto.unidadMedida}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Precio de compra</p>
            <p className="text-sm font-medium">{formatCurrency(producto.precioCompra)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Precio de venta</p>
            <p className="text-sm font-medium">{formatCurrency(producto.precioVenta)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stock actual</p>
            <p className="text-sm font-medium">
              {formatNumber(producto.stockActual)}
              {producto.stockBajo && (
                <StatusBadge label="Stock bajo" tone="warning" className="ml-2" />
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stock minimo</p>
            <p className="text-sm font-medium">{formatNumber(producto.stockMinimo)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <StatusBadge label={producto.activo ? "Activo" : "Inactivo"} tone={activoTone(producto.activo)} />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={producto.activo ? "Desactivar producto" : "Activar producto"}
        description={
          producto.activo
            ? `Esta seguro de desactivar "${producto.nombre}"?`
            : `Esta seguro de activar "${producto.nombre}"?`
        }
        confirmLabel={producto.activo ? "Desactivar" : "Activar"}
        destructive={producto.activo}
        loading={cambiarEstado.isPending}
        onConfirm={() =>
          cambiarEstado.mutate({ activo: !producto.activo }, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </div>
  );
}
