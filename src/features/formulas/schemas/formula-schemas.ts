import { z } from "zod";

import { UnidadMedidaInsumo } from "@/types/enums";

const detalleFormulaSchema = z.object({
  numero: z
    .string()
    .min(1, "El numero de frasco es obligatorio")
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) > 0,
      "El numero de frasco debe ser un entero mayor que cero",
    ),
  insumoId: z.string().min(1, "Selecciona un quimico"),
  cantidad: z
    .string()
    .min(1, "La cantidad es obligatoria")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "La cantidad debe ser mayor que cero"),
});

const detallesFormulaSchema = z
  .array(detalleFormulaSchema)
  .min(1, "Agrega al menos un quimico")
  .superRefine((detalles, ctx) => {
    const vistos = new Set<string>();
    detalles.forEach((detalle, index) => {
      if (!detalle.numero) return;
      if (vistos.has(detalle.numero)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El numero de frasco esta repetido",
          path: [index, "numero"],
        });
      } else {
        vistos.add(detalle.numero);
      }
    });
  });

export const crearFormulaSchema = z.object({
  productoId: z.string().min(1, "El producto es obligatorio"),
  cantidadBase: z
    .string()
    .min(1, "La cantidad base es obligatoria")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "La cantidad base debe ser mayor que cero"),
  unidadBase: z.enum(
    [
      UnidadMedidaInsumo.UND,
      UnidadMedidaInsumo.KG,
      UnidadMedidaInsumo.GR,
      UnidadMedidaInsumo.LT,
      UnidadMedidaInsumo.ML,
    ],
    { message: "La unidad base es obligatoria" },
  ),
  detalles: detallesFormulaSchema,
});
export type CrearFormulaFormValues = z.infer<typeof crearFormulaSchema>;

export const actualizarFormulaSchema = crearFormulaSchema.omit({ productoId: true });
export type ActualizarFormulaFormValues = z.infer<typeof actualizarFormulaSchema>;

export const producirFormulaSchema = z.object({
  cantidad: z
    .string()
    .min(1, "La cantidad es obligatoria")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "La cantidad debe ser mayor que cero"),
  motivo: z.string().max(200, "El motivo debe tener maximo 200 caracteres").optional().or(z.literal("")),
});
export type ProducirFormulaFormValues = z.infer<typeof producirFormulaSchema>;
