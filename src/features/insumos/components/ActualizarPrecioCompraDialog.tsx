import { useState } from "react";
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
import { useActualizarPrecioCompraInsumo } from "@/features/insumos/hooks/use-insumos";
import {
  actualizarPrecioCompraInsumoSchema,
  type ActualizarPrecioCompraInsumoFormValues,
} from "@/features/insumos/schemas/insumo-schemas";

interface ActualizarPrecioCompraDialogProps {
  insumoId: number;
  precioCompraActual: number | null;
}

export function ActualizarPrecioCompraDialog({ insumoId, precioCompraActual }: ActualizarPrecioCompraDialogProps) {
  const [open, setOpen] = useState(false);
  const actualizarPrecioCompra = useActualizarPrecioCompraInsumo(insumoId);

  const form = useForm<ActualizarPrecioCompraInsumoFormValues>({
    resolver: zodResolver(actualizarPrecioCompraInsumoSchema),
    defaultValues: { precioCompra: precioCompraActual != null ? String(precioCompraActual) : "" },
  });

  async function onSubmit(values: ActualizarPrecioCompraInsumoFormValues) {
    await actualizarPrecioCompra.mutateAsync({ precioCompra: Number(values.precioCompra) });
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset({ precioCompra: precioCompraActual != null ? String(precioCompraActual) : "" });
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6">
          <Pencil className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar precio de compra</DialogTitle>
          <DialogDescription>Actualiza el precio de compra del insumo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="precioCompra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de compra</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" min="0" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={actualizarPrecioCompra.isPending}>
                {actualizarPrecioCompra.isPending && <Loader2 className="size-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
