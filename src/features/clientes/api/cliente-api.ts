import { apiClient, buildQueryParams } from "@/lib/api-client";
import type { DependenciasResponse, PageResponse, PageQuery } from "@/types/api";
import type {
  ActualizarClienteRequest,
  AsignarRutaRequest,
  CambiarEstadoRequest,
  ClienteResponse,
  CrearClienteRequest,
  EstablecerPrecioClienteProductoRequest,
  HistorialClienteResponse,
  ObservacionClienteResponse,
  PrecioClienteProductoResponse,
  RegistrarObservacionRequest,
} from "@/features/clientes/types";

export interface ListarClientesParams extends PageQuery {
  texto?: string;
}

export const clienteApi = {
  listar: (params: ListarClientesParams) =>
    apiClient
      .get<PageResponse<ClienteResponse>>("/clientes", { params: buildQueryParams(params) })
      .then((r) => r.data),

  obtener: (id: number) => apiClient.get<ClienteResponse>(`/clientes/${id}`).then((r) => r.data),

  crear: (payload: CrearClienteRequest) =>
    apiClient.post<ClienteResponse>("/clientes", payload).then((r) => r.data),

  actualizar: (id: number, payload: ActualizarClienteRequest) =>
    apiClient.put<ClienteResponse>(`/clientes/${id}`, payload).then((r) => r.data),

  cambiarEstado: (id: number, payload: CambiarEstadoRequest) =>
    apiClient.patch<ClienteResponse>(`/clientes/${id}/estado`, payload).then((r) => r.data),

  asignarRuta: (id: number, payload: AsignarRutaRequest) =>
    apiClient.patch<ClienteResponse>(`/clientes/${id}/ruta`, payload).then((r) => r.data),

  registrarObservacion: (clienteId: number, payload: RegistrarObservacionRequest) =>
    apiClient
      .post<ObservacionClienteResponse>(`/clientes/${clienteId}/observaciones`, payload)
      .then((r) => r.data),

  listarObservaciones: (clienteId: number, params: PageQuery) =>
    apiClient
      .get<PageResponse<ObservacionClienteResponse>>(`/clientes/${clienteId}/observaciones`, {
        params: buildQueryParams(params),
      })
      .then((r) => r.data),

  listarHistorial: (clienteId: number, params: PageQuery) =>
    apiClient
      .get<PageResponse<HistorialClienteResponse>>(`/clientes/${clienteId}/historial`, {
        params: buildQueryParams(params),
      })
      .then((r) => r.data),

  listarPrecios: (clienteId: number, params: PageQuery) =>
    apiClient
      .get<PageResponse<PrecioClienteProductoResponse>>(`/clientes/${clienteId}/precios`, {
        params: buildQueryParams(params),
      })
      .then((r) => r.data),

  establecerPrecio: (clienteId: number, payload: EstablecerPrecioClienteProductoRequest) =>
    apiClient
      .put<PrecioClienteProductoResponse>(`/clientes/${clienteId}/precios`, payload)
      .then((r) => r.data),

  eliminarPrecio: (clienteId: number, precioId: number) =>
    apiClient.delete<void>(`/clientes/${clienteId}/precios/${precioId}`).then((r) => r.data),

  eliminar: (id: number, cascada = false) =>
    apiClient.delete<void>(`/clientes/${id}`, { params: cascada ? { cascada: true } : undefined }).then((r) => r.data),

  obtenerDependencias: (id: number) =>
    apiClient.get<DependenciasResponse>(`/clientes/${id}/dependencias`).then((r) => r.data),
};
