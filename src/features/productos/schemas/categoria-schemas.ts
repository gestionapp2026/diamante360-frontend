import { z } from "zod";

export const crearCategoriaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(60, "El nombre debe tener maximo 60 caracteres"),
  descripcion: z.string().max(150, "La descripcion debe tener maximo 150 caracteres").optional(),
});
export type CrearCategoriaFormValues = z.infer<typeof crearCategoriaSchema>;

export const actualizarCategoriaSchema = crearCategoriaSchema;
export type ActualizarCategoriaFormValues = z.infer<typeof actualizarCategoriaSchema>;
