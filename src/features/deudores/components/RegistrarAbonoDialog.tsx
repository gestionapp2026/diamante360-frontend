import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HandCoins, Loader2 } from "lucide-react";

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
import { useRegistrarAbono } from "@/features/deudores/hooks/use-deudores";
import { registrarAbonoSchema, type RegistrarAbonoFormValues } from "@/features/deudores/schemas/deudor-schemas";
import { formatCurrency } from "@/lib/format";
import { MedioPago } from "@/types/enums";

interface RegistrarAbonoDialogProps {
  cuentaId: number;
  saldoPendiente: number;
}

const MEDIOS_PAGO: { value: MedioPago; label: string }[] = [
  { value: MedioPago.EFECTIVO, label: "Efectivo" },
  { value: MedioPago.NEQUI, label: "Nequi" },
  { value: MedioPago.LLAVE, label: "Llave" },
  { value: MedioPago.DAVIPLATA, label: "Daviplata" },
  { value: MedioPago.BANCOLOMBIA, label: "Bancolombia" },
];

export function RegistrarAbonoDialog({ cuentaId, saldoPendiente }: RegistrarAbonoDialogProps) {
  const [open, setOpen] = useState(false);
  const registrarAbono = useRegistrarAbono(cuentaId);

  const form = useForm<RegistrarAbonoFormValues>({
    resolver: zodResolver(registrarAbonoSchema),
    defaultValues: { monto: "", medioPago: MedioPago.EFECTIVO },
  });

  async function onSubmit(values: RegistrarAbonoFormValues) {
    await registrarAbono.mutateAsync({ monto: Number(values.monto), medioPago: values.medioPago });
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
          <HandCoins className="size-4" />
          Registrar abono
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar abono</DialogTitle>
          <DialogDescription>Registra un abono a la cuenta por cobrar.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto del abono</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" min="0" placeholder="0" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Saldo pendiente: {formatCurrency(saldoPendiente)}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medioPago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medio de pago</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
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
            <DialogFooter>
              <Button type="submit" disabled={registrarAbono.isPending}>
                {registrarAbono.isPending && <Loader2 className="size-4 animate-spin" />}
                Registrar abono
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
