import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/common/Combobox";
import { PageHeader } from "@/components/common/PageHeader";
import { useClientes } from "@/features/clientes/hooks/use-clientes";
import { useCrearOrden } from "@/features/ordenes/hooks/use-ordenes";
import { crearOrdenSchema, type CrearOrdenFormValues } from "@/features/ordenes/schemas/orden-schemas";
import { useProductos } from "@/features/productos/hooks/use-productos";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency } from "@/lib/format";
import { PERMISOS } from "@/types/enums";

export function NuevaOrdenPage() {
  const navigate = useNavigate();
  const crearOrden = useCrearOrden();
  const { puede } = usePermiso();

  const [clienteTexto, setClienteTexto] = useState("");
  const [debouncedClienteTexto, setDebouncedClienteTexto] = useState("");

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

  const { data: productosData } = useProductos({ page: 0, size: 200, sort: "nombre,asc" });

  const productosActivos = useMemo(
    () => (productosData?.contenido ?? []).filter((p) => p.activo),
    [productosData],
  );

  const productoOptions = useMemo(
    () =>
      productosActivos.map((p) => ({
        value: String(p.id),
        label: p.nombre,
        description: formatCurrency(p.precioVenta),
      })),
    [productosActivos],
  );

  const hoy = format(new Date(), "yyyy-MM-dd");

  const form = useForm<CrearOrdenFormValues>({
    resolver: zodResolver(crearOrdenSchema),
    defaultValues: {
      clienteId: "",
      fechaEntrega: hoy,
      observaciones: "",
      detalles: [{ productoId: "", cantidad: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detalles",
  });

  async function onSubmit(values: CrearOrdenFormValues) {
    const nuevaOrden = await crearOrden.mutateAsync({
      clienteId: Number(values.clienteId),
      fechaEntrega: values.fechaEntrega,
      observaciones: values.observaciones || undefined,
      detalles: values.detalles.map((d) => ({
        productoId: Number(d.productoId),
        cantidad: Number(d.cantidad),
      })),
    });
    navigate(`/ordenes/${nuevaOrden.id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva orden"
        description="Registra una orden anticipada para un cliente, a despachar en una fecha futura."
        actions={
          <Button variant="outline" onClick={() => navigate("/ordenes")}>
            <ArrowLeft className="size-4" />
            Volver
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Datos de la orden</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="clienteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <Combobox
                            options={clienteOptions}
                            value={field.value || null}
                            onChange={(value) => field.onChange(value ?? "")}
                            onSearchChange={setClienteTexto}
                            loading={clientesLoading}
                            placeholder="Selecciona un cliente"
                            emptyText="Sin clientes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fechaEntrega"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de entrega</FormLabel>
                        <FormControl>
                          <Input type="date" min={hoy} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="observaciones"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Observaciones (opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Indicaciones adicionales para el despacho" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Productos</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ productoId: "", cantidad: "" })}
                  >
                    <Plus className="size-4" />
                    Agregar producto
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {typeof form.formState.errors.detalles?.message === "string" && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.detalles.message}</p>
                  )}
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[2fr_1fr_auto]">
                      <FormField
                        control={form.control}
                        name={`detalles.${index}.productoId`}
                        render={({ field: productoField }) => (
                          <FormItem>
                            <FormLabel>Producto</FormLabel>
                            <FormControl>
                              <Combobox
                                options={productoOptions}
                                value={productoField.value || null}
                                onChange={(value) => productoField.onChange(value ?? "")}
                                placeholder="Selecciona un producto"
                                emptyText="Sin productos"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`detalles.${index}.cantidad`}
                        render={({ field: cantidadField }) => (
                          <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl>
                              <Input type="number" step="any" placeholder="0" {...cantidadField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={crearOrden.isPending}>
                  {crearOrden.isPending && <Loader2 className="size-4 animate-spin" />}
                  Crear orden
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/ordenes")}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
