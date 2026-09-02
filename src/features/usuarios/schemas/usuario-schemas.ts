import { z } from "zod";

export const crearUsuarioSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener minimo 3 caracteres")
    .max(50, "El nombre de usuario debe tener maximo 50 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Solo letras, numeros, puntos, guiones y guion bajo"),
  password: z
    .string()
    .min(8, "La contrasena debe tener minimo 8 caracteres")
    .max(100, "La contrasena debe tener maximo 100 caracteres")
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Debe contener al menos una letra y un numero"),
  nombreCompleto: z
    .string()
    .min(1, "El nombre completo es obligatorio")
    .max(120, "El nombre completo debe tener maximo 120 caracteres"),
  rolId: z.string().min(1, "El rol es obligatorio"),
});
export type CrearUsuarioFormValues = z.infer<typeof crearUsuarioSchema>;

export const actualizarUsuarioSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener minimo 3 caracteres")
    .max(50, "El nombre de usuario debe tener maximo 50 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Solo letras, numeros, puntos, guiones y guion bajo"),
  nombreCompleto: z
    .string()
    .min(1, "El nombre completo es obligatorio")
    .max(120, "El nombre completo debe tener maximo 120 caracteres"),
  rolId: z.string().min(1, "El rol es obligatorio"),
});
export type ActualizarUsuarioFormValues = z.infer<typeof actualizarUsuarioSchema>;
