import { apiClient, buildQueryParams } from "@/lib/api-client";
import type { DependenciasResponse, PageResponse, PageQuery } from "@/types/api";
import type {
  ActualizarRutaRequest,
  CambiarEstadoRequest,
  ClienteResponse,
  CrearRutaRequest,
  RutaResponse,
} from "@/features/clientes/types";

export const rutaApi = {
  listar: () => apiClient.get<RutaResponse[]>("/rutas").then((r) => r.data),

  obtener: (id: number) => apiClient.get<RutaResponse>(`/rutas/${id}`).then((r) => r.data),

  crear: (payload: CrearRutaRequest) => apiClient.post<RutaResponse>("/rutas", payload).then((r) => r.data),

  actualizar: (id: number, payload: ActualizarRutaRequest) =>
    apiClient.put<RutaResponse>(`/rutas/${id}`, payload).then((r) => r.data),

  cambiarEstado: (id: number, payload: CambiarEstadoRequest) =>
    apiClient.patch<RutaResponse>(`/rutas/${id}/estado`, payload).then((r) => r.data),

  listarClientes: (id: number, params: PageQuery) =>
    apiClient
      .get<PageResponse<ClienteResponse>>(`/rutas/${id}/clientes`, { params: buildQueryParams(params) })
      .then((r) => r.data),

  eliminar: (id: number, cascada = false) =>
    apiClient.delete<void>(`/rutas/${id}`, { params: cascada ? { cascada: true } : undefined }).then((r) => r.data),

  obtenerDependencias: (id: number) =>
    apiClient.get<DependenciasResponse>(`/rutas/${id}/dependencias`).then((r) => r.data),
};
