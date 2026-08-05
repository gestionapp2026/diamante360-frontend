// Tipos espejo de los DTOs del backend (inventario.presentation.dto.* y producto.presentation.dto.*).

import type { TipoMovimiento, UnidadMedida } from "@/types/enums";

export interface MovimientoResponse {
  id: number;
  productoId: number;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  stockResultante: number;
  motivo: string;
  usuarioId: number;
  fecha: string;
}

export interface RegistrarMovimientoRequest {
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  motivo: string;
}

/**
 * Tipo local minimo de producto (solo los campos que este modulo renderiza).
 * No se importa desde src/features/productos: ese modulo pertenece a otro agente.
 * Espejo parcial de producto.presentation.dto.response.ProductoResponse.
 */
export interface ProductoResumen {
  id: number;
  nombre: string;
  categoriaId: number | null;
  categoriaNombre: string | null;
  unidadMedida: UnidadMedida;
  stockActual: number;
  stockMinimo: number;
  stockBajo: boolean;
  activo: boolean;
}
