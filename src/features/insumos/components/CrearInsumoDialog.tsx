import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrearInsumoQuimico } from "@/features/insumos/hooks/use-insumos";
import {
  crearInsumoQuimicoSchema,
  type CrearInsumoQuimicoFormValues,
} from "@/features/insumos/schemas/insumo-schemas";
import { UnidadMedidaInsumo } from "@/types/enums";

const UNIDADES: { value: UnidadMedidaInsumo; label: string }[] = [
  { value: UnidadMedidaInsumo.UND, label: "Unidad (UND)" },
  { value: UnidadMedidaInsumo.KG, label: "Kilogramo (KG)" },
  { value: UnidadMedidaInsumo.GR, label: "Gramo (GR)" },
  { value: UnidadMedidaInsumo.LT, label: "Litro (LT)" },
  { value: UnidadMedidaInsumo.ML, label: "Mililitro (ML)" },
];

export function CrearInsumoDialog() {
  const [open, setOpen] = useState(false);
  const crear = useCrearInsumoQuimico();

  const form = useForm<CrearInsumoQuimicoFormValues>({
    resolver: zodResolver(crearInsumoQuimicoSchema),
    defaultValues: { nombre: "", unidadMedida: UnidadMedidaInsumo.UND, precioCompra: "" },
  });

  async function onSubmit(values: CrearInsumoQuimicoFormValues) {
    await crear.mutateAsync({
      nombre: values.nombre,
      unidadMedida: values.unidadMedida,
      precioCompra: values.precioCompra ? Number(values.precioCompra) : null,
    });
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nuevo insumo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo insumo quimico</DialogTitle>
          <DialogDescription>Registra un nuevo insumo quimico en el inventario.</DialogDescription>
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
                    <Input placeholder="Hipoclorito de sodio" {...field} />
                  </FormControl>
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una unidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UNIDADES.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="precioCompra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de compra (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" min="0" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={crear.isPending}>
                {crear.isPending && <Loader2 className="size-4 animate-spin" />}
                Crear insumo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
