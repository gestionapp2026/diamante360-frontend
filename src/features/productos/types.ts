// Tipos espejo de los DTOs del backend (modulo producto).
// Ver: backend/src/main/java/com/eldiamante360/producto/presentation/dto/**

import type { TipoVenta, UnidadMedida } from "@/types/enums";

export interface ProductoResponse {
  id: number;
  nombre: string;
  categoriaId: number;
  categoriaNombre: string;
  tipoVenta: TipoVenta;
  unidadMedida: UnidadMedida;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  stockBajo: boolean;
  activo: boolean;
}

export interface CategoriaResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CrearProductoRequest {
  nombre: string;
  categoriaId: number;
  tipoVenta: TipoVenta;
  unidadMedida: UnidadMedida;
  precioCompra: number;
  /** Opcional al crear: si no se envia, el backend lo deja en 0 y se define despues editando el producto. */
  precioVenta?: number;
  stockInicial: number;
  stockMinimo: number;
}

export interface ActualizarProductoRequest {
  nombre: string;
  categoriaId: number;
  precioCompra: number;
  precioVenta: number;
  stockMinimo: number;
}

export interface CambiarEstadoRequest {
  activo: boolean;
}

export interface CrearCategoriaRequest {
  nombre: string;
  descripcion?: string | null;
}

export interface ActualizarCategoriaRequest {
  nombre: string;
  descripcion?: string | null;
}
