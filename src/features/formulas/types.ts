// Tipos espejo de los DTOs del backend (formula.presentation.dto.*).
// Ver: backend/src/main/java/com/eldiamante360/formula/presentation/dto/**

import type { UnidadMedidaInsumo } from "@/types/enums";

export interface DetalleFormulaResponse {
  id: number;
  numero: number;
  insumoId: number;
  // null cuando quien consulta no tiene INSUMO_VER_NOMBRE (p.ej. rol PLANTA).
  // Siempre renderizar como "Quimico #<numero>" en ese caso, nunca "null"/vacio.
  insumoNombre: string | null;
  cantidad: number;
  unidadMedidaInsumo: UnidadMedidaInsumo;
}

export interface FormulaResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidadBase: number;
  unidadBase: UnidadMedidaInsumo;
  activo: boolean;
  detalles: DetalleFormulaResponse[];
}

export interface DetalleFormulaRequest {
  numero: number;
  insumoId: number;
  cantidad: number;
}

export interface CrearFormulaRequest {
  productoId: number;
  cantidadBase: number;
  unidadBase: UnidadMedidaInsumo;
  detalles: DetalleFormulaRequest[];
}

export interface ActualizarFormulaRequest {
  cantidadBase: number;
  unidadBase: UnidadMedidaInsumo;
  detalles: DetalleFormulaRequest[];
}

export interface CambiarEstadoRequest {
  activo: boolean;
}

export interface ProducirFormulaRequest {
  cantidad: number;
  motivo?: string | null;
}

export interface ConsumoInsumoResponse {
  insumoId: number;
  // Deliberadamente sin insumoNombre: siempre solo numero, sin importar el permiso de quien consulta.
  numero: number;
  cantidadConsumida: number;
}

export interface ProduccionFormulaResponse {
  formulaId: number;
  productoId: number;
  productoNombre: string;
  cantidadProducida: number;
  consumos: ConsumoInsumoResponse[];
}

export interface FormulasQuery {
  page?: number;
  size?: number;
  sort?: string;
}
