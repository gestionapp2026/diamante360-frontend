// Tipos espejo de los DTOs del backend (deudor.presentation.dto.*).

import type { EstadoCuentaPorCobrar, MedioPago, TipoEventoCuentaPorCobrar } from "@/types/enums";

export interface CuentaPorCobrarResponse {
  id: number;
  facturaId: number;
  numeroFactura: string;
  clienteId: number;
  clienteNombre: string;
  /** Null cuando el usuario autenticado no tiene el permiso CLIENTE_VER_DOCUMENTO. */
  clienteNumeroDocumento: string | null;
  montoOriginal: number;
  saldoPendiente: number;
  estado: EstadoCuentaPorCobrar;
  usuarioId: number;
  fecha: string;
  fechaUltimoAbono: string | null;
  fechaAnulacion: string | null;
}

export interface AbonoResponse {
  id: number;
  cuentaPorCobrarId: number;
  monto: number;
  usuarioId: number;
  fecha: string;
  medioPago: MedioPago;
}

export interface RegistrarAbonoRequest {
  monto: number;
  medioPago: MedioPago;
}

export interface SaldoClienteResponse {
  clienteId: number;
  saldoPendiente: number;
}

export interface HistorialCuentaPorCobrarResponse {
  id: number;
  cuentaPorCobrarId: number;
  tipoEvento: TipoEventoCuentaPorCobrar;
  descripcion: string | null;
  usuarioId: number;
  fecha: string;
}
