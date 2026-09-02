// Tipos espejo de los DTOs del backend (cliente.presentation.dto.*).

import type { TipoDocumentoCliente, TipoEventoCliente } from "@/types/enums";

export interface ClienteResponse {
  id: number;
  tipoDocumento: TipoDocumentoCliente;
  /** Null cuando el usuario autenticado no tiene el permiso CLIENTE_VER_DOCUMENTO. */
  numeroDocumento: string | null;
  nombre: string;
  telefonos: string[];
  email: string | null;
  direccion: string | null;
  rutaId: number | null;
  rutaNombre: string | null;
  activo: boolean;
}

export interface RutaResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface ObservacionClienteResponse {
  id: number;
  clienteId: number;
  texto: string;
  usuarioId: number;
  fecha: string;
}

export interface HistorialClienteResponse {
  id: number;
  clienteId: number;
  tipoEvento: TipoEventoCliente;
  descripcion: string | null;
  usuarioId: number;
  fecha: string;
}

export interface PrecioClienteProductoResponse {
  id: number;
  clienteId: number;
  productoId: number;
  productoNombre: string | null;
  precio: number;
}

export interface EstablecerPrecioClienteProductoRequest {
  productoId: number;
  precio: number;
}

export interface CrearClienteRequest {
  tipoDocumento: TipoDocumentoCliente;
  numeroDocumento: string;
  nombre: string;
  telefonos?: string[] | null;
  email?: string | null;
  direccion?: string | null;
  rutaId?: number | null;
}

export interface ActualizarClienteRequest {
  nombre: string;
  telefonos?: string[] | null;
  email?: string | null;
  direccion?: string | null;
}

export interface CambiarEstadoRequest {
  activo: boolean;
}

export interface AsignarRutaRequest {
  rutaId: number | null;
}

export interface RegistrarObservacionRequest {
  texto: string;
}

export interface CrearRutaRequest {
  nombre: string;
  descripcion?: string | null;
}

export interface ActualizarRutaRequest {
  nombre: string;
  descripcion?: string | null;
}
