import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategorias } from "@/features/productos/hooks/use-categorias";
import { useActualizarProducto } from "@/features/productos/hooks/use-productos";
import {
  actualizarProductoSchema,
  type ActualizarProductoFormValues,
} from "@/features/productos/schemas/producto-schemas";
import type { ProductoResponse } from "@/features/productos/types";

interface ProductoEditarDialogProps {
  producto: ProductoResponse;
}

export function ProductoEditarDialog({ producto }: ProductoEditarDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: categorias } = useCategorias();
  const actualizarProducto = useActualizarProducto(producto.id);

  const form = useForm<ActualizarProductoFormValues>({
    resolver: zodResolver(actualizarProductoSchema),
    defaultValues: {
      nombre: producto.nombre,
      categoriaId: String(producto.categoriaId),
      precioCompra: String(producto.precioCompra),
      precioVenta: String(producto.precioVenta),
      stockMinimo: String(producto.stockMinimo),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: producto.nombre,
        categoriaId: String(producto.categoriaId),
        precioCompra: String(producto.precioCompra),
        precioVenta: String(producto.precioVenta),
        stockMinimo: String(producto.stockMinimo),
      });
    }
  }, [open, producto, form]);

  async function onSubmit(values: ActualizarProductoFormValues) {
    await actualizarProducto.mutateAsync({
      nombre: values.nombre,
      categoriaId: Number(values.categoriaId),
      precioCompra: Number(values.precioCompra),
      precioVenta: Number(values.precioVenta),
      stockMinimo: Number(values.stockMinimo),
    });
    setOpen(false);
  }

  const categoriasActivas = categorias?.filter((c) => c.activo || c.id === producto.categoriaId) ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>Actualiza los datos del producto.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Costilla ahumada 5 Kg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriasActivas.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precioCompra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de compra</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="precioVenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de venta</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="stockMinimo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock minimo</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={actualizarProducto.isPending}>
                {actualizarProducto.isPending && <Loader2 className="size-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
