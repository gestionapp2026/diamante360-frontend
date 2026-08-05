// Tipos espejo de los DTOs del backend (insumoquimico.presentation.dto.*).
// Ver: backend/src/main/java/com/eldiamante360/insumoquimico/presentation/dto/**

import type { TipoMovimientoInsumo, UnidadMedidaInsumo } from "@/types/enums";

export interface InsumoQuimicoResponse {
  id: number;
  nombre: string;
  unidadMedida: UnidadMedidaInsumo;
  stockActual: number;
  activo: boolean;
  precioCompra: number | null;
}

export interface LoteResponse {
  id: number;
  insumoId: number;
  numeroLote: string | null;
  fechaVencimiento: string | null;
  cantidadActual: number;
  fechaIngreso: string;
  vencido: boolean;
}

export interface MovimientoInsumoResponse {
  id: number;
  insumoId: number;
  loteId: number;
  tipoMovimiento: TipoMovimientoInsumo;
  cantidad: number;
  stockResultante: number;
  motivo: string;
  usuarioId: number;
  fecha: string;
}

export interface CrearInsumoQuimicoRequest {
  nombre: string;
  unidadMedida: UnidadMedidaInsumo;
  precioCompra?: number | null;
}

export interface CambiarEstadoRequest {
  activo: boolean;
}

export interface ActualizarPrecioCompraRequest {
  precioCompra: number;
}

export interface RegistrarEntradaInsumoRequest {
  numeroLote?: string | null;
  fechaVencimiento?: string | null;
  cantidad: number;
  motivo: string;
}

export interface RegistrarSalidaInsumoRequest {
  loteId: number;
  cantidad: number;
  motivo: string;
}

export interface InsumosQuimicosQuery {
  page?: number;
  size?: number;
  sort?: string;
}
