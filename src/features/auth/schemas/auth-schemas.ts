import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contrasena es obligatoria"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

const passwordRule = z
  .string()
  .min(8, "La contrasena debe tener minimo 8 caracteres")
  .regex(/(?=.*[A-Za-z])(?=.*\d).+/, "La contrasena debe contener al menos una letra y un numero");

export const cambiarPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, "La contrasena actual es obligatoria"),
    passwordNueva: passwordRule,
    confirmarPassword: z.string().min(1, "Confirma la nueva contrasena"),
  })
  .refine((data) => data.passwordNueva === data.confirmarPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmarPassword"],
  });
export type CambiarPasswordFormValues = z.infer<typeof cambiarPasswordSchema>;
