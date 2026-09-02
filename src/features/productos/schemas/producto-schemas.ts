import { z } from "zod";
import { TipoVenta, UnidadMedida } from "@/types/enums";

export const crearProductoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre debe tener maximo 120 caracteres"),
  categoriaId: z.string().min(1, "La categoria es obligatoria"),
  tipoVenta: z.enum([TipoVenta.UNIDAD, TipoVenta.PESO_VARIABLE], {
    message: "El tipo de venta es obligatorio",
  }),
  unidadMedida: z.enum([UnidadMedida.UND, UnidadMedida.KG, UnidadMedida.LB], {
    message: "La unidad de medida es obligatoria",
  }),
  precioCompra: z
    .string()
    .min(1, "El precio de compra es obligatorio")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "El precio de compra no puede ser negativo"),
  stockInicial: z
    .string()
    .min(1, "El stock inicial es obligatorio")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "El stock inicial no puede ser negativo"),
  stockMinimo: z
    .string()
    .min(1, "El stock minimo es obligatorio")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "El stock minimo no puede ser negativo"),
});
export type CrearProductoFormValues = z.input<typeof crearProductoSchema>;

export const actualizarProductoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre debe tener maximo 120 caracteres"),
  categoriaId: z.string().min(1, "La categoria es obligatoria"),
  precioCompra: z
    .string()
    .min(1, "El precio de compra es obligatorio")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "El precio de compra no puede ser negativo"),
  precioVenta: z
    .string()
    .min(1, "El precio de venta es obligatorio")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "El precio de venta no puede ser negativo"),
  stockMinimo: z
    .string()
    .min(1, "El stock minimo es obligatorio")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "El stock minimo no puede ser negativo"),
});
export type ActualizarProductoFormValues = z.input<typeof actualizarProductoSchema>;
