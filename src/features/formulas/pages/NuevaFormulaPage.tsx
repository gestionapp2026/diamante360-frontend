import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/common/Combobox";
import { PageHeader } from "@/components/common/PageHeader";
import { useCrearFormula } from "@/features/formulas/hooks/use-formulas";
import { crearFormulaSchema, type CrearFormulaFormValues } from "@/features/formulas/schemas/formula-schemas";
import { useInsumosQuimicos } from "@/features/insumos/hooks/use-insumos";
import { useProductos } from "@/features/productos/hooks/use-productos";
import { UnidadMedidaInsumo } from "@/types/enums";

const UNIDADES: { value: UnidadMedidaInsumo; label: string }[] = [
  { value: UnidadMedidaInsumo.UND, label: "Unidad (UND)" },
  { value: UnidadMedidaInsumo.KG, label: "Kilogramo (KG)" },
  { value: UnidadMedidaInsumo.GR, label: "Gramo (GR)" },
  { value: UnidadMedidaInsumo.LT, label: "Litro (LT)" },
  { value: UnidadMedidaInsumo.ML, label: "Mililitro (ML)" },
];

export function NuevaFormulaPage() {
  const navigate = useNavigate();
  const crearFormula = useCrearFormula();

  const { data: productosData } = useProductos({ page: 0, size: 200, sort: "nombre,asc" });
  const productoOptions = useMemo(
    () =>
      (productosData?.contenido ?? [])
        .filter((p) => p.activo)
        .map((p) => ({ value: String(p.id), label: p.nombre })),
    [productosData],
  );

  const { data: insumosData } = useInsumosQuimicos({ page: 0, size: 200, sort: "nombre,asc" });
  const insumoOptions = useMemo(
    () =>
      (insumosData?.contenido ?? [])
        .filter((i) => i.activo)
        .map((i) => ({ value: String(i.id), label: i.nombre })),
    [insumosData],
  );

  const form = useForm<CrearFormulaFormValues>({
    resolver: zodResolver(crearFormulaSchema),
    defaultValues: {
      productoId: "",
      cantidadBase: "",
      unidadBase: UnidadMedidaInsumo.UND,
      detalles: [{ numero: "1", insumoId: "", cantidad: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detalles",
  });

  async function onSubmit(values: CrearFormulaFormValues) {
    const nuevaFormula = await crearFormula.mutateAsync({
      productoId: Number(values.productoId),
      cantidadBase: Number(values.cantidadBase),
      unidadBase: values.unidadBase,
      detalles: values.detalles.map((d) => ({
        numero: Number(d.numero),
        insumoId: Number(d.insumoId),
        cantidad: Number(d.cantidad),
      })),
    });
    navigate(`/formulas/${nuevaFormula.id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva formula"
        description="Define la receta de quimicos necesaria para producir un producto."
        actions={
          <Button variant="outline" onClick={() => navigate("/formulas")}>
            <ArrowLeft className="size-4" />
            Volver
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la formula</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quimicos</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ numero: String(fields.length + 1), insumoId: "", cantidad: "" })}
              >
                <Plus className="size-4" />
                Agregar quimico
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => navigate("/formulas")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crearFormula.isPending}>
              {crearFormula.isPending && <Loader2 className="size-4 animate-spin" />}
              Crear formula
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
