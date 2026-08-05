import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

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
import { Combobox } from "@/components/common/Combobox";
import { useActualizarFormula } from "@/features/formulas/hooks/use-formulas";
import {
  actualizarFormulaSchema,
  type ActualizarFormulaFormValues,
} from "@/features/formulas/schemas/formula-schemas";
import type { FormulaResponse } from "@/features/formulas/types";
import { useInsumosQuimicos } from "@/features/insumos/hooks/use-insumos";
import { UnidadMedidaInsumo } from "@/types/enums";

const UNIDADES: { value: UnidadMedidaInsumo; label: string }[] = [
  { value: UnidadMedidaInsumo.UND, label: "Unidad (UND)" },
  { value: UnidadMedidaInsumo.KG, label: "Kilogramo (KG)" },
  { value: UnidadMedidaInsumo.GR, label: "Gramo (GR)" },
  { value: UnidadMedidaInsumo.LT, label: "Litro (LT)" },
  { value: UnidadMedidaInsumo.ML, label: "Mililitro (ML)" },
];

function valoresDesdeFormula(formula: FormulaResponse): ActualizarFormulaFormValues {
  return {
    cantidadBase: String(formula.cantidadBase),
    unidadBase: formula.unidadBase,
    detalles: formula.detalles.map((d) => ({
      numero: String(d.numero),
      insumoId: String(d.insumoId),
      cantidad: String(d.cantidad),
    })),
  };
}

interface EditarFormulaDialogProps {
  formula: FormulaResponse;
}

export function EditarFormulaDialog({ formula }: EditarFormulaDialogProps) {
  const [open, setOpen] = useState(false);
  const actualizar = useActualizarFormula(formula.id);

  const { data: insumosData } = useInsumosQuimicos({ page: 0, size: 200, sort: "nombre,asc" });
  const insumoOptions = (insumosData?.contenido ?? [])
    .filter((i) => i.activo)
    .map((i) => ({ value: String(i.id), label: i.nombre }));

  const form = useForm<ActualizarFormulaFormValues>({
    resolver: zodResolver(actualizarFormulaSchema),
    defaultValues: valoresDesdeFormula(formula),
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "detalles" });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(valoresDesdeFormula(formula));
    }
  }

  async function onSubmit(values: ActualizarFormulaFormValues) {
    await actualizar.mutateAsync({
      cantidadBase: Number(values.cantidadBase),
      unidadBase: values.unidadBase,
      detalles: values.detalles.map((d) => ({
        numero: Number(d.numero),
        insumoId: Number(d.insumoId),
        cantidad: Number(d.cantidad),
      })),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar formula</DialogTitle>
          <DialogDescription>
            Actualiza la cantidad base y los quimicos de la formula de "{formula.productoNombre}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="cantidadBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad base</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unidadBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad base</FormLabel>
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
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Quimicos</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ numero: "", insumoId: "", cantidad: "" })}
                >
                  <Plus className="size-4" />
                  Agregar quimico
                </Button>
              </div>
              {typeof form.formState.errors.detalles?.message === "string" && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.detalles.message}</p>
              )}
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_2fr_1fr_auto]">
                  <FormField
                    control={form.control}
                    name={`detalles.${index}.numero`}
                    render={({ field: numeroField }) => (
                      <FormItem>
                        <FormLabel>Frasco #</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" min="1" placeholder="1" {...numeroField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`detalles.${index}.insumoId`}
                    render={({ field: insumoField }) => (
                      <FormItem>
                        <FormLabel>Quimico</FormLabel>
                        <FormControl>
                          <Combobox
                            options={insumoOptions}
                            value={insumoField.value || null}
                            onChange={(value) => insumoField.onChange(value ?? "")}
                            placeholder="Selecciona un quimico"
                            emptyText="Sin quimicos"
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
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={actualizar.isPending}>
                {actualizar.isPending && <Loader2 className="size-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
