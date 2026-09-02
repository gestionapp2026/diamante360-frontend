import { apiClient, buildQueryParams } from "@/lib/api-client";
import type { DependenciasResponse, PageQuery, PageResponse } from "@/types/api";
import type { EstadoFactura } from "@/types/enums";
import type {
  CrearFacturaRequest,
  FacturaResponse,
  HistorialFacturaResponse,
} from "@/features/facturas/types";

export interface ListarFacturasParams extends PageQuery {
  clienteId?: number;
  estado?: EstadoFactura;
}

export const facturaApi = {
  listar: (params: ListarFacturasParams) =>
    apiClient
      .get<PageResponse<FacturaResponse>>("/facturas", { params: buildQueryParams(params) })
      .then((r) => r.data),

  obtener: (id: number) => apiClient.get<FacturaResponse>(`/facturas/${id}`).then((r) => r.data),

  obtenerPdf: (id: number) =>
    apiClient.get<Blob>(`/facturas/${id}/pdf`, { responseType: "blob" }).then((r) => r.data),

  crear: (payload: CrearFacturaRequest) =>
    apiClient.post<FacturaResponse>("/facturas", payload).then((r) => r.data),

  anular: (id: number) => apiClient.patch<FacturaResponse>(`/facturas/${id}/anular`).then((r) => r.data),

  listarHistorial: (facturaId: number, params: PageQuery) =>
    apiClient
      .get<PageResponse<HistorialFacturaResponse>>(`/facturas/${facturaId}/historial`, {
        params: buildQueryParams(params),
      })
      .then((r) => r.data),

  eliminar: (id: number, cascada = false) =>
    apiClient.delete<void>(`/facturas/${id}`, { params: cascada ? { cascada: true } : undefined }).then((r) => r.data),

  obtenerDependencias: (id: number) =>
    apiClient.get<DependenciasResponse>(`/facturas/${id}/dependencias`).then((r) => r.data),
};
