import { z } from "zod";

const optionalDescripcion = z
  .string()
  .max(200, "La descripcion debe tener maximo 200 caracteres")
  .optional()
  .or(z.literal(""));

export const rutaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(80, "El nombre debe tener maximo 80 caracteres"),
  descripcion: optionalDescripcion,
});
export type RutaFormValues = z.infer<typeof rutaSchema>;
