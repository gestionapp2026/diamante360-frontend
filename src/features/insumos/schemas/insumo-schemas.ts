import { z } from "zod";

import { UnidadMedidaInsumo } from "@/types/enums";

export const crearInsumoQuimicoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(120, "El nombre debe tener maximo 120 caracteres"),
  unidadMedida: z.enum([
    UnidadMedidaInsumo.UND,
    UnidadMedidaInsumo.KG,
    UnidadMedidaInsumo.GR,
    UnidadMedidaInsumo.LT,
    UnidadMedidaInsumo.ML,
  ]),
  precioCompra: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0),
      "El precio de compra no puede ser negativo",
    ),
});
export type CrearInsumoQuimicoFormValues = z.infer<typeof crearInsumoQuimicoSchema>;

export const registrarEntradaInsumoSchema = z.object({
  numeroLote: z.string().max(60, "El numero de lote debe tener maximo 60 caracteres").optional().or(z.literal("")),
  fechaVencimiento: z.string().optional().or(z.literal("")),
  cantidad: z
    .string()
    .min(1, "La cantidad es obligatoria")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "La cantidad debe ser mayor que cero"),
  motivo: z.string().min(1, "El motivo es obligatorio").max(200, "El motivo debe tener maximo 200 caracteres"),
});
export type RegistrarEntradaInsumoFormValues = z.infer<typeof registrarEntradaInsumoSchema>;

export const registrarSalidaInsumoSchema = z.object({
  loteId: z.string().min(1, "El lote es obligatorio"),
  cantidad: z
    .string()
    .min(1, "La cantidad es obligatoria")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "La cantidad debe ser mayor que cero"),
  motivo: z.string().min(1, "El motivo es obligatorio").max(200, "El motivo debe tener maximo 200 caracteres"),
});
export type RegistrarSalidaInsumoFormValues = z.infer<typeof registrarSalidaInsumoSchema>;

export const cambiarEstadoInsumoSchema = z.object({
  activo: z.boolean(),
});
export type CambiarEstadoInsumoFormValues = z.infer<typeof cambiarEstadoInsumoSchema>;

export const actualizarPrecioCompraInsumoSchema = z.object({
  precioCompra: z
    .string()
    .min(1, "El precio de compra es obligatorio")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "El precio de compra no puede ser negativo"),
});
export type ActualizarPrecioCompraInsumoFormValues = z.infer<typeof actualizarPrecioCompraInsumoSchema>;
