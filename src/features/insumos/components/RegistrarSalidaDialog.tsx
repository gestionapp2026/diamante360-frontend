import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackageMinus } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { useLotesPorInsumo, useRegistrarSalidaInsumo } from "@/features/insumos/hooks/use-insumos";
import {
  registrarSalidaInsumoSchema,
  type RegistrarSalidaInsumoFormValues,
} from "@/features/insumos/schemas/insumo-schemas";
import { formatDate } from "@/lib/format";

interface RegistrarSalidaDialogProps {
  insumoId: number;
}

export function RegistrarSalidaDialog({ insumoId }: RegistrarSalidaDialogProps) {
  const [open, setOpen] = useState(false);
  const registrarSalida = useRegistrarSalidaInsumo(insumoId);
  const lotesQuery = useLotesPorInsumo(open ? insumoId : undefined, { page: 0, size: 100, sort: "fechaVencimiento,asc" });
  const lotesDisponibles = (lotesQuery.data?.contenido ?? []).filter((l) => l.cantidadActual > 0);

  const form = useForm<RegistrarSalidaInsumoFormValues>({
    resolver: zodResolver(registrarSalidaInsumoSchema),
    defaultValues: { loteId: "", cantidad: "", motivo: "" },
  });

  async function onSubmit(values: RegistrarSalidaInsumoFormValues) {
    await registrarSalida.mutateAsync({
      loteId: Number(values.loteId),
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
          <PackageMinus className="size-4" />
          Registrar salida
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar salida</DialogTitle>
          <DialogDescription>Descuenta cantidad de un lote existente del insumo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="loteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lote</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un lote" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lotesDisponibles.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">Sin lotes disponibles</div>
                      ) : (
                        lotesDisponibles.map((lote) => (
                          <SelectItem key={lote.id} value={String(lote.id)}>
                            {lote.numeroLote ?? `Lote #${lote.id}`} · disp. {lote.cantidadActual}
                            {lote.fechaVencimiento ? ` · vence ${formatDate(lote.fechaVencimiento)}` : ""}
                          </SelectItem>
                        ))
                      )}
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
                    <Textarea placeholder="Uso en produccion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={registrarSalida.isPending}>
                {registrarSalida.isPending && <Loader2 className="size-4 animate-spin" />}
                Registrar salida
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
