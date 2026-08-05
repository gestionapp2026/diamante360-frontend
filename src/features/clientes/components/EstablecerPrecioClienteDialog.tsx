import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/common/Combobox";
import { useEstablecerPrecioCliente } from "@/features/clientes/hooks/use-clientes";
import {
  establecerPrecioClienteSchema,
  type EstablecerPrecioClienteFormValues,
} from "@/features/clientes/schemas/cliente-schemas";
import { useProductos } from "@/features/productos/hooks/use-productos";
import { formatCurrency } from "@/lib/format";

interface EstablecerPrecioClienteDialogProps {
  clienteId: number;
}

export function EstablecerPrecioClienteDialog({ clienteId }: EstablecerPrecioClienteDialogProps) {
  const [open, setOpen] = useState(false);
  const establecerPrecio = useEstablecerPrecioCliente(clienteId);

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

  const form = useForm<EstablecerPrecioClienteFormValues>({
    resolver: zodResolver(establecerPrecioClienteSchema),
    defaultValues: { productoId: "", precio: "" },
  });

  useEffect(() => {
    if (!open) form.reset({ productoId: "", precio: "" });
  }, [open, form]);

  async function onSubmit(values: EstablecerPrecioClienteFormValues) {
    await establecerPrecio.mutateAsync({
      productoId: Number(values.productoId),
      precio: Number(values.precio),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nuevo precio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Precio especial por producto</DialogTitle>
          <DialogDescription>
            Define el precio de venta que se usara para este cliente en vez del precio estandar del producto.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto</FormLabel>
                  <FormControl>
                    <Combobox
                      options={productoOptions}
                      value={field.value || null}
                      onChange={(value) => field.onChange(value ?? "")}
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
              name="precio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="any" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={establecerPrecio.isPending}>
                {establecerPrecio.isPending && <Loader2 className="size-4 animate-spin" />}
                Guardar precio
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
