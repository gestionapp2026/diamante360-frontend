import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackagePlus } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { useRegistrarEntradaInsumo } from "@/features/insumos/hooks/use-insumos";
import {
  registrarEntradaInsumoSchema,
  type RegistrarEntradaInsumoFormValues,
} from "@/features/insumos/schemas/insumo-schemas";

interface RegistrarEntradaDialogProps {
  insumoId: number;
}

export function RegistrarEntradaDialog({ insumoId }: RegistrarEntradaDialogProps) {
  const [open, setOpen] = useState(false);
  const registrarEntrada = useRegistrarEntradaInsumo(insumoId);

  const form = useForm<RegistrarEntradaInsumoFormValues>({
    resolver: zodResolver(registrarEntradaInsumoSchema),
    defaultValues: { numeroLote: "", fechaVencimiento: "", cantidad: "", motivo: "" },
  });

  async function onSubmit(values: RegistrarEntradaInsumoFormValues) {
    await registrarEntrada.mutateAsync({
      numeroLote: values.numeroLote || null,
      fechaVencimiento: values.fechaVencimiento || null,
      cantidad: Number(values.cantidad),
      motivo: values.motivo,
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
        <Button variant="outline">
          <PackagePlus className="size-4" />
          Registrar entrada
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar entrada</DialogTitle>
          <DialogDescription>Ingresa un nuevo lote o suma cantidad al inventario del insumo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="numeroLote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numero de lote (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="L-2026-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fechaVencimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de vencimiento (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                    <Input type="number" step="any" min="0" placeholder="0" {...field} />
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
                    <Textarea placeholder="Compra a proveedor XYZ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={registrarEntrada.isPending}>
                {registrarEntrada.isPending && <Loader2 className="size-4 animate-spin" />}
                Registrar entrada
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
