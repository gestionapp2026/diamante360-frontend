import { apiClient, buildQueryParams } from "@/lib/api-client";
import type { DependenciasResponse, PageResponse } from "@/types/api";
import type { CrearOrdenRequest, OrdenFiltros, OrdenResponse } from "@/features/ordenes/types";

export const ordenApi = {
  listar: (params: OrdenFiltros) =>
    apiClient
      .get<PageResponse<OrdenResponse>>("/ordenes", { params: buildQueryParams(params) })
      .then((r) => r.data),

  obtener: (id: number) => apiClient.get<OrdenResponse>(`/ordenes/${id}`).then((r) => r.data),

  crear: (payload: CrearOrdenRequest) => apiClient.post<OrdenResponse>("/ordenes", payload).then((r) => r.data),

  despachar: (id: number) => apiClient.patch<OrdenResponse>(`/ordenes/${id}/despachar`).then((r) => r.data),

  anular: (id: number) => apiClient.patch<OrdenResponse>(`/ordenes/${id}/anular`).then((r) => r.data),

  eliminar: (id: number, cascada = false) =>
    apiClient.delete<void>(`/ordenes/${id}`, { params: cascada ? { cascada: true } : undefined }).then((r) => r.data),

  obtenerDependencias: (id: number) =>
    apiClient.get<DependenciasResponse>(`/ordenes/${id}/dependencias`).then((r) => r.data),
};
