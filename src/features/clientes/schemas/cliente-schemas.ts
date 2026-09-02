import { z } from "zod";

import { TipoDocumentoCliente } from "@/types/enums";

/** Un cliente puede tener varios telefonos; cada campo del formulario se representa como { valor } para poder usar useFieldArray. */
const telefonosSchema = z
  .array(
    z.object({
      valor: z.string().max(20, "Cada telefono debe tener maximo 20 caracteres"),
    }),
  )
  .max(5, "Maximo 5 telefonos por cliente");

const optionalEmail = z
  .string()
  .email("El email debe tener un formato valido")
  .max(120, "El email debe tener maximo 120 caracteres")
  .optional()
  .or(z.literal(""));

const optionalDireccion = z
  .string()
  .max(200, "La direccion debe tener maximo 200 caracteres")
  .optional()
  .or(z.literal(""));

export const crearClienteSchema = z.object({
  tipoDocumento: z.enum([
    TipoDocumentoCliente.CC,
    TipoDocumentoCliente.NIT,
    TipoDocumentoCliente.CE,
    TipoDocumentoCliente.PASAPORTE,
  ]),
  numeroDocumento: z
    .string()
    .min(1, "El numero de documento es obligatorio")
    .max(20, "El numero de documento debe tener maximo 20 caracteres"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(150, "El nombre debe tener maximo 150 caracteres"),
  telefonos: telefonosSchema,
  email: optionalEmail,
  direccion: optionalDireccion,
  rutaId: z.string().optional(),
});
export type CrearClienteFormValues = z.infer<typeof crearClienteSchema>;

export const actualizarClienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(150, "El nombre debe tener maximo 150 caracteres"),
  telefonos: telefonosSchema,
  email: optionalEmail,
  direccion: optionalDireccion,
});
export type ActualizarClienteFormValues = z.infer<typeof actualizarClienteSchema>;

/** Convierte los telefonos del formulario ({ valor }[]) al array de strings que espera el backend, descartando los vacios. */
export function telefonosFormValuesToArray(telefonos: { valor: string }[]): string[] {
  return telefonos.map((t) => t.valor.trim()).filter((v) => v.length > 0);
}

/** Convierte el array de telefonos del backend al shape que usa el formulario ({ valor }[]). */
export function telefonosArrayToFormValues(telefonos: string[] | null | undefined): { valor: string }[] {
  return telefonos && telefonos.length > 0 ? telefonos.map((valor) => ({ valor })) : [{ valor: "" }];
}

export const registrarObservacionSchema = z.object({
  texto: z
    .string()
    .min(1, "El texto de la observacion es obligatorio")
    .max(500, "El texto debe tener maximo 500 caracteres"),
});
export type RegistrarObservacionFormValues = z.infer<typeof registrarObservacionSchema>;

export const establecerPrecioClienteSchema = z.object({
  productoId: z.string().min(1, "El producto es obligatorio"),
  precio: z
    .string()
    .min(1, "El precio es obligatorio")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "El precio no puede ser negativo"),
});
export type EstablecerPrecioClienteFormValues = z.infer<typeof establecerPrecioClienteSchema>;
