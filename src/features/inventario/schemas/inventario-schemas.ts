import { z } from "zod";

import { TipoMovimiento } from "@/types/enums";

export const registrarMovimientoSchema = z.object({
  tipoMovimiento: z.enum([TipoMovimiento.ENTRADA, TipoMovimiento.SALIDA, TipoMovimiento.AJUSTE], {
    message: "El tipo de movimiento es obligatorio",
  }),
  cantidad: z
    .string()
    .min(1, "La cantidad es obligatoria")
    .refine((v) => !Number.isNaN(Number(v)), "La cantidad debe ser un numero")
    .refine((v) => Number(v) >= 0, "La cantidad no puede ser negativa"),
  motivo: z
    .string()
    .min(1, "El motivo es obligatorio")
    .max(200, "El motivo debe tener maximo 200 caracteres"),
});
export type RegistrarMovimientoFormValues = z.infer<typeof registrarMovimientoSchema>;
