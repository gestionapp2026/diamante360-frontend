// Tipos espejo de los DTOs del backend (modulo orden).
// Ver: backend/src/main/java/com/eldiamante360/orden/presentation/dto/**

import type { EstadoOrden } from "@/types/enums";
import type { PageQuery } from "@/types/api";

export interface DetalleOrdenResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
}

export interface OrdenResponse {
  id: number;
  numero: string;
  clienteId: number;
  clienteNombre: string;
  fechaCreacion: string;
  fechaEntrega: string;
  estado: EstadoOrden;
  observaciones: string | null;
  usuarioId: number;
  usuarioNombre: string;
  fechaDespacho: string | null;
  fechaAnulacion: string | null;
  detalles: DetalleOrdenResponse[];
}

export interface DetalleOrdenRequestItem {
  productoId: number;
  cantidad: number;
}

export interface CrearOrdenRequest {
  clienteId: number;
  fechaEntrega: string;
  observaciones?: string;
  detalles: DetalleOrdenRequestItem[];
}

export interface OrdenFiltros extends PageQuery {
  clienteId?: number;
  estado?: EstadoOrden;
  fechaEntregaDesde?: string;
  fechaEntregaHasta?: string;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
}
