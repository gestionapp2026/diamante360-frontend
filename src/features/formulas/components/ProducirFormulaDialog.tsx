import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Factory, Loader2 } from "lucide-react";

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
import { useProducirFormula } from "@/features/formulas/hooks/use-formulas";
import { producirFormulaSchema, type ProducirFormulaFormValues } from "@/features/formulas/schemas/formula-schemas";
import type { DetalleFormulaResponse, ProduccionFormulaResponse } from "@/features/formulas/types";
import { formatNumber } from "@/lib/format";

interface ProducirFormulaDialogProps {
  formulaId: number;
  detalles: DetalleFormulaResponse[];
}

export function ProducirFormulaDialog({ formulaId, detalles }: ProducirFormulaDialogProps) {
  const [open, setOpen] = useState(false);
  const [resultado, setResultado] = useState<ProduccionFormulaResponse | null>(null);
  const producir = useProducirFormula(formulaId);

  const form = useForm<ProducirFormulaFormValues>({
    resolver: zodResolver(producirFormulaSchema),
    defaultValues: { cantidad: "", motivo: "" },
  });

  const unidadPorNumero = new Map(detalles.map((d) => [d.numero, d.unidadMedidaInsumo]));

  async function onSubmit(values: ProducirFormulaFormValues) {
    const respuesta = await producir.mutateAsync({
      cantidad: Number(values.cantidad),
      motivo: values.motivo || undefined,
    });
    setResultado(respuesta);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset();
      setResultado(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Factory className="size-4" />
          Producir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Producir formula</DialogTitle>
          <DialogDescription>
            Registra una produccion consumiendo los quimicos de esta formula segun la cantidad indicada.
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Cantidad producida</p>
              <p className="text-sm font-medium">{formatNumber(resultado.cantidadProducida)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Consumos</p>
              <ul className="space-y-1 rounded-lg border p-3 text-sm">
                {resultado.consumos.map((consumo) => (
                  <li key={consumo.numero} className="flex items-center justify-between">
                    <span>Frasco #{consumo.numero}</span>
                    <span className="font-medium">
                      {formatNumber(consumo.cantidadConsumida)} {unidadPorNumero.get(consumo.numero) ?? ""} consumidos
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad a producir</FormLabel>
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
                    <FormLabel>Motivo (opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Orden de produccion #123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={producir.isPending}>
                  {producir.isPending && <Loader2 className="size-4 animate-spin" />}
                  Producir
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
