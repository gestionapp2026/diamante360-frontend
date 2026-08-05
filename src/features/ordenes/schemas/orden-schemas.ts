import { z } from "zod";

export const crearOrdenSchema = z.object({
  clienteId: z.string().min(1, "El cliente es obligatorio"),
  fechaEntrega: z
    .string()
    .min(1, "La fecha de entrega es obligatoria")
    .refine((v) => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fecha = new Date(`${v}T00:00:00`);
      return fecha >= hoy;
    }, "La fecha de entrega no puede ser anterior a hoy"),
  observaciones: z.string().max(1000, "Maximo 1000 caracteres").optional(),
  detalles: z
    .array(
      z.object({
        productoId: z.string().min(1, "Selecciona un producto"),
        cantidad: z
          .string()
          .min(1, "La cantidad es obligatoria")
          .refine((v) => Number(v) > 0, "La cantidad debe ser mayor a cero"),
      }),
    )
    .min(1, "Agrega al menos un producto"),
});
export type CrearOrdenFormValues = z.infer<typeof crearOrdenSchema>;
