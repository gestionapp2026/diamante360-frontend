import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategorias } from "@/features/productos/hooks/use-categorias";
import { useCrearProducto } from "@/features/productos/hooks/use-productos";
import { crearProductoSchema, type CrearProductoFormValues } from "@/features/productos/schemas/producto-schemas";
import { TipoVenta, UnidadMedida } from "@/types/enums";

interface ProductoCrearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_VALUES: CrearProductoFormValues = {
  nombre: "",
  categoriaId: "",
  tipoVenta: TipoVenta.UNIDAD,
  unidadMedida: UnidadMedida.UND,
  precioCompra: "",
  precioVenta: "",
  stockInicial: "",
  stockMinimo: "",
};

const UNIDADES_POR_TIPO_VENTA: Record<string, UnidadMedida[]> = {
  [TipoVenta.UNIDAD]: [UnidadMedida.UND],
  [TipoVenta.PESO_VARIABLE]: [UnidadMedida.KG, UnidadMedida.LB],
};

export function ProductoCrearDialog({ open, onOpenChange }: ProductoCrearDialogProps) {
  const { data: categorias } = useCategorias();
  const crearProducto = useCrearProducto();

  const form = useForm<CrearProductoFormValues>({
    resolver: zodResolver(crearProductoSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const tipoVenta = form.watch("tipoVenta");

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
    }
  }, [open, form]);

  useEffect(() => {
    const opciones = UNIDADES_POR_TIPO_VENTA[tipoVenta] ?? [];
    if (!opciones.includes(form.getValues("unidadMedida") as UnidadMedida)) {
      form.setValue("unidadMedida", opciones[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoVenta]);

  async function onSubmit(values: CrearProductoFormValues) {
    try {
      await crearProducto.mutateAsync({
        nombre: values.nombre,
        categoriaId: Number(values.categoriaId),
        tipoVenta: values.tipoVenta as TipoVenta,
        unidadMedida: values.unidadMedida as UnidadMedida,
        precioCompra: Number(values.precioCompra),
        precioVenta: Number(values.precioVenta),
        stockInicial: Number(values.stockInicial),
        stockMinimo: Number(values.stockMinimo),
      });
      onOpenChange(false);
    } catch {
      // el error ya se notifica via toast en el hook
    }
  }

  const categoriasActivas = categorias?.filter((c) => c.activo) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo producto</DialogTitle>
          <DialogDescription>Registra un nuevo producto en el catalogo.</DialogDescription>
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
                name="tipoVenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de venta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TipoVenta.UNIDAD}>Unidad</SelectItem>
                        <SelectItem value={TipoVenta.PESO_VARIABLE}>Peso variable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidadMedida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de medida</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(UNIDADES_POR_TIPO_VENTA[tipoVenta] ?? []).map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock inicial</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={crearProducto.isPending}>
                {crearProducto.isPending && <Loader2 className="size-4 animate-spin" />}
                Crear producto
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
