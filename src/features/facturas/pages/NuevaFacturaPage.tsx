import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/common/Combobox";
import { PageHeader } from "@/components/common/PageHeader";
import { useClientes, usePreciosCliente } from "@/features/clientes/hooks/use-clientes";
import { useCrearFactura } from "@/features/facturas/hooks/use-facturas";
import { crearFacturaSchema, type CrearFacturaFormValues } from "@/features/facturas/schemas/factura-schemas";
import { useProductos } from "@/features/productos/hooks/use-productos";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency } from "@/lib/format";
import { MedioPago, PERMISOS, TipoPago } from "@/types/enums";

const TIPOS_PAGO: { value: TipoPago; label: string }[] = [
  { value: TipoPago.CONTADO, label: "Contado" },
  { value: TipoPago.CREDITO, label: "Credito" },
];

const MEDIOS_PAGO: { value: MedioPago; label: string }[] = [
  { value: MedioPago.EFECTIVO, label: "Efectivo" },
  { value: MedioPago.NEQUI, label: "Nequi" },
  { value: MedioPago.LLAVE, label: "Llave" },
  { value: MedioPago.DAVIPLATA, label: "Daviplata" },
  { value: MedioPago.BANCOLOMBIA, label: "Bancolombia" },
];

export function NuevaFacturaPage() {
  const navigate = useNavigate();
  const crearFactura = useCrearFactura();
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

  const form = useForm<CrearFacturaFormValues>({
    resolver: zodResolver(crearFacturaSchema),
    defaultValues: {
      clienteId: "",
      tipoPago: TipoPago.CONTADO,
      medioPago: undefined,
      detalles: [{ productoId: "", cantidad: "", porcentajeDescuento: "0" }],
    },
  });

  const tipoPago = form.watch("tipoPago");
  const clienteIdSeleccionado = form.watch("clienteId");
  const clienteIdNumero = clienteIdSeleccionado ? Number(clienteIdSeleccionado) : undefined;

  // Precios preestablecidos para el cliente seleccionado: al facturar, el
  // backend ya usa el precio especial del cliente en vez del precio de venta
  // del producto (ver CrearFacturaService), pero antes esa sustitucion solo
  // se veia reflejada hasta emitir la factura. Aqui se replica la misma
  // logica en el frontend para que el total estimado (y el precio por linea)
  // ya se calculen con el precio real que se le cobrara a ese cliente.
  const { data: preciosClienteData } = usePreciosCliente(clienteIdNumero, { page: 0, size: 200 });

  const preciosClienteMap = useMemo(() => {
    const mapa = new Map<number, number>();
    for (const precio of preciosClienteData?.contenido ?? []) {
      mapa.set(precio.productoId, precio.precio);
    }
    return mapa;
  }, [preciosClienteData]);

  const { data: productosData } = useProductos({ page: 0, size: 200, sort: "nombre,asc" });

  const productosActivos = useMemo(
    () => (productosData?.contenido ?? []).filter((p) => p.activo),
    [productosData],
  );

  const productoOptions = useMemo(
    () =>
      productosActivos.map((p) => {
        const precioEfectivo = preciosClienteMap.get(p.id) ?? p.precioVenta;
        const tienePrecioEspecial = preciosClienteMap.has(p.id);
        return {
          value: String(p.id),
          label: p.nombre,
          description: tienePrecioEspecial
            ? `${formatCurrency(precioEfectivo)} (precio especial)`
            : formatCurrency(precioEfectivo),
        };
      }),
    [productosActivos, preciosClienteMap],
  );

  useEffect(() => {
    if (tipoPago === TipoPago.CREDITO) {
      form.setValue("medioPago", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoPago]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detalles",
  });

  // useWatch (en lugar de form.watch) es necesario para que el total se
  // recalcule en cada tecleo cuando se usa junto con useFieldArray; watch()
  // llamado directamente en el render no se resincroniza de forma confiable
  // con los valores del field array hasta que ocurre un append/remove.
  const detalles = useWatch({ control: form.control, name: "detalles" });

  const totalEstimado = useMemo(() => {
    return detalles.reduce((acc, detalle) => {
      const producto = productosActivos.find((p) => String(p.id) === detalle.productoId);
      const cantidad = Number(detalle.cantidad);
      const descuento = Number(detalle.porcentajeDescuento || 0);
      if (!producto || !detalle.productoId || !cantidad || Number.isNaN(cantidad)) return acc;
      const precioUnitario = preciosClienteMap.get(producto.id) ?? producto.precioVenta;
      const subtotal = precioUnitario * cantidad * (1 - descuento / 100);
      return acc + subtotal;
    }, 0);
  }, [detalles, productosActivos, preciosClienteMap]);

  async function onSubmit(values: CrearFacturaFormValues) {
    const nuevaFactura = await crearFactura.mutateAsync({
      clienteId: Number(values.clienteId),
      tipoPago: values.tipoPago,
      medioPago: values.tipoPago === TipoPago.CONTADO ? values.medioPago : undefined,
      detalles: values.detalles.map((d) => ({
        productoId: Number(d.productoId),
        cantidad: Number(d.cantidad),
        porcentajeDescuento: Number(d.porcentajeDescuento || 0),
      })),
    });
    navigate(`/facturas/${nuevaFactura.id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva factura"
        description="Registra una nueva venta y genera la factura para el cliente."
        actions={
          <Button variant="outline" onClick={() => navigate("/facturas")}>
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
                  <CardTitle>Datos de la factura</CardTitle>
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
                    name="tipoPago"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de pago</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIPOS_PAGO.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {tipoPago === TipoPago.CONTADO && (
                    <FormField
                      control={form.control}
                      name="medioPago"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medio de pago</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un medio de pago" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MEDIOS_PAGO.map((medio) => (
                                <SelectItem key={medio.value} value={medio.value}>
                                  {medio.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Productos</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ productoId: "", cantidad: "", porcentajeDescuento: "0" })}
                  >
                    <Plus className="size-4" />
                    Agregar producto
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {typeof form.formState.errors.detalles?.message === "string" && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.detalles.message}</p>
                  )}
                  {fields.map((field, index) => {
                    const detalleActual = detalles?.[index];
                    const productoActual = productosActivos.find(
                      (p) => String(p.id) === detalleActual?.productoId,
                    );
                    const precioUnitarioAplicado = productoActual
                      ? (preciosClienteMap.get(productoActual.id) ?? productoActual.precioVenta)
                      : null;
                    const esPrecioEspecial = productoActual ? preciosClienteMap.has(productoActual.id) : false;

                    return (
                    <div key={field.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
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
                      <FormField
                        control={form.control}
                        name={`detalles.${index}.porcentajeDescuento`}
                        render={({ field: descuentoField }) => (
                          <FormItem>
                            <FormLabel>% Descuento</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} max={100} step="any" {...descuentoField} />
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
                      {precioUnitarioAplicado !== null && (
                        <p className="text-xs text-muted-foreground sm:col-span-4">
                          Precio unitario aplicado: {formatCurrency(precioUnitarioAplicado)}
                          {esPrecioEspecial && (
                            <span className="ml-1 font-medium text-primary">(precio especial de este cliente)</span>
                          )}
                        </p>
                      )}
                    </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total estimado</span>
                    <span className="text-lg font-semibold">{formatCurrency(totalEstimado)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total estimado, sujeto a redondeo del servidor.</p>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={crearFactura.isPending}>
                  {crearFactura.isPending && <Loader2 className="size-4 animate-spin" />}
                  Crear factura
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/facturas")}>
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
