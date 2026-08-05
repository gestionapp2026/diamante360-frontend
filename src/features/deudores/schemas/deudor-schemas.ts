import { z } from "zod";

import { MedioPago } from "@/types/enums";

export const registrarAbonoSchema = z.object({
  monto: z
    .string()
    .min(1, "El monto es obligatorio")
    .refine((v) => Number(v) > 0, "El monto debe ser mayor a cero"),
  medioPago: z.enum([MedioPago.EFECTIVO, MedioPago.NEQUI, MedioPago.LLAVE, MedioPago.DAVIPLATA, MedioPago.BANCOLOMBIA], {
    message: "El medio de pago es obligatorio",
  }),
});
export type RegistrarAbonoFormValues = z.infer<typeof registrarAbonoSchema>;
