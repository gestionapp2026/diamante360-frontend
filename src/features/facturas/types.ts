// Tipos espejo de los DTOs del backend (modulo factura).
// Ver: backend/src/main/java/com/eldiamante360/factura/presentation/dto/**

import type { EstadoFactura, MedioPago, TipoEventoFactura, TipoPago } from "@/types/enums";

export interface DetalleFacturaResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  porcentajeDescuento: number;
  subtotal: number;
  descuento: number;
  total: number;
}

export interface FacturaResponse {
  id: number;
  numero: string;
  clienteId: number;
  clienteNombre: string;
  /** Null cuando el usuario autenticado no tiene el permiso CLIENTE_VER_DOCUMENTO. */
  clienteNumeroDocumento: string | null;
  tipoPago: TipoPago;
  detalles: DetalleFacturaResponse[];
  estado: EstadoFactura;
  subtotal: number;
  descuento: number;
  total: number;
  usuarioId: number;
  usuarioNombre: string;
  fecha: string;
  fechaAnulacion: string | null;
  medioPago: MedioPago | null;
}

export interface DetalleFacturaRequest {
  productoId: number;
  cantidad: number;
  porcentajeDescuento: number;
}

export interface CrearFacturaRequest {
  clienteId: number;
  tipoPago: TipoPago;
  detalles: DetalleFacturaRequest[];
  medioPago?: MedioPago | null;
}

export interface HistorialFacturaResponse {
  id: number;
  facturaId: number;
  tipoEvento: TipoEventoFactura;
  descripcion: string | null;
  usuarioId: number;
  fecha: string;
}
