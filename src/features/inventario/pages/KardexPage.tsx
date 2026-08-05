import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useProducto } from "@/features/inventario/hooks/use-productos";
import { useMovimientos, useRegistrarMovimiento } from "@/features/inventario/hooks/use-movimientos";
import {
  registrarMovimientoSchema,
  type RegistrarMovimientoFormValues,
} from "@/features/inventario/schemas/inventario-schemas";
import type { MovimientoResponse } from "@/features/inventario/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatDateTime, formatNumber } from "@/lib/format";
import { PERMISOS, TipoMovimiento } from "@/types/enums";

const TIPO_LABEL: Record<TipoMovimiento, string> = {
  ENTRADA: "Entrada",
  SALIDA: "Salida",
  AJUSTE: "Ajuste",
};

const TIPO_TONE: Record<TipoMovimiento, "success" | "destructive" | "primary"> = {
  ENTRADA: "success",
  SALIDA: "destructive",
  AJUSTE: "primary",
};

export function KardexPage() {
  const params = useParams<{ id: string }>();
  const productoId = Number(params.id);

  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const { puede } = usePermiso();

  const { data: producto, isLoading: isLoadingProducto } = useProducto(productoId);
  const { data: movimientos, isLoading: isLoadingMovimientos } = useMovimientos(productoId, {
    page,
    size: 10,
    sort: "fecha,desc",
  });
  const registrarMovimiento = useRegistrarMovimiento(productoId);

  const form = useForm<RegistrarMovimientoFormValues>({
    resolver: zodResolver(registrarMovimientoSchema),
    defaultValues: { tipoMovimiento: TipoMovimiento.ENTRADA, cantidad: "", motivo: "" },
  });

  async function onSubmit(values: RegistrarMovimientoFormValues) {
    await registrarMovimiento.mutateAsync({
      tipoMovimiento: values.tipoMovimiento,
      cantidad: Number(values.cantidad),
      motivo: values.motivo,
    });
    form.reset({ tipoMovimiento: TipoMovimiento.ENTRADA, cantidad: "", motivo: "" });
    setOpen(false);
  }

  const columns = useMemo<ColumnDef<MovimientoResponse, any>[]>(
    () => [
      {
        accessorKey: "tipoMovimiento",
        header: "Tipo",
        cell: ({ row }) => (
          <StatusBadge label={TIPO_LABEL[row.original.tipoMovimiento]} tone={TIPO_TONE[row.original.tipoMovimiento]} />
        ),
      },
      {
        accessorKey: "cantidad",
        header: "Cantidad",
        cell: ({ row }) => formatNumber(row.original.cantidad),
      },
      {
        accessorKey: "stockResultante",
        header: "Stock resultante",
        cell: ({ row }) => formatNumber(row.original.stockResultante),
      },
      {
        accessorKey: "motivo",
        header: "Motivo",
      },
      {
        accessorKey: "usuarioId",
        header: "Usuario",
        cell: ({ row }) => `#${row.original.usuarioId}`,
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ row }) => formatDateTime(row.original.fecha),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to={`/productos/${productoId}`}>
            <ArrowLeft className="size-4" />
            Volver al producto
          </Link>
        </Button>
        <PageHeader
          title={producto ? `Kardex de ${producto.nombre}` : "Kardex"}
          description="Historial de movimientos de inventario del producto"
          actions={
            puede(PERMISOS.INVENTARIO_AJUSTAR) && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="size-4" />
                    Registrar movimiento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar movimiento</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="tipoMovimiento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de movimiento</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={TipoMovimiento.ENTRADA}>Entrada</SelectItem>
                                <SelectItem value={TipoMovimiento.SALIDA}>Salida</SelectItem>
                                <SelectItem value={TipoMovimiento.AJUSTE}>Ajuste</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cantidad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl>
                              <Input type="number" step="any" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="motivo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Motivo</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Motivo del movimiento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={registrarMovimiento.isPending}>
                          {registrarMovimiento.isPending && <Loader2 className="size-4 animate-spin" />}
                          Registrar
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProducto ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Cargando producto...
            </div>
          ) : producto ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Stock actual</p>
                <p className="text-lg font-semibold">
                  {formatNumber(producto.stockActual)} {producto.unidadMedida}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock minimo</p>
                <p className="text-lg font-semibold">{formatNumber(producto.stockMinimo)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Categoria</p>
                <p className="text-lg font-semibold">{producto.categoriaNombre ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <StatusBadge
                  label={producto.stockBajo ? "Stock bajo" : "Normal"}
                  tone={producto.stockBajo ? "warning" : "success"}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Producto no encontrado.</p>
          )}
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={movimientos?.contenido ?? []}
        isLoading={isLoadingMovimientos}
        page={movimientos}
        onPageChange={setPage}
        emptyTitle="Sin movimientos"
        emptyDescription="Este producto todavia no tiene movimientos de inventario registrados."
      />
    </div>
  );
}
