import { z } from "zod";

import { MedioPago, TipoPago } from "@/types/enums";

export const crearFacturaSchema = z.object({
  clienteId: z.string().min(1, "El cliente es obligatorio"),
  tipoPago: z.enum([TipoPago.CONTADO, TipoPago.CREDITO]),
  medioPago: z
    .enum([MedioPago.EFECTIVO, MedioPago.NEQUI, MedioPago.LLAVE, MedioPago.DAVIPLATA, MedioPago.BANCOLOMBIA])
    .optional(),
  detalles: z
    .array(
      z.object({
        productoId: z.string().min(1, "Selecciona un producto"),
        cantidad: z
          .string()
          .min(1, "La cantidad es obligatoria")
          .refine((v) => Number(v) > 0, "La cantidad debe ser mayor a cero"),
        porcentajeDescuento: z
          .string()
          .refine((v) => v === "" || (Number(v) >= 0 && Number(v) <= 100), "Debe estar entre 0 y 100"),
      }),
    )
    .min(1, "Agrega al menos un producto"),
});
export type CrearFacturaFormValues = z.infer<typeof crearFacturaSchema>;
