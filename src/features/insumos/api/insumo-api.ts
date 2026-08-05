import { apiClient, buildQueryParams } from "@/lib/api-client";
import type { DependenciasResponse, PageResponse, PageQuery } from "@/types/api";
import type {
  ActualizarPrecioCompraRequest,
  CambiarEstadoRequest,
  CrearInsumoQuimicoRequest,
  InsumoQuimicoResponse,
  InsumosQuimicosQuery,
  LoteResponse,
  MovimientoInsumoResponse,
  RegistrarEntradaInsumoRequest,
  RegistrarSalidaInsumoRequest,
} from "@/features/insumos/types";

export const insumoApi = {
  listar: (query: InsumosQuimicosQuery) =>
    apiClient
      .get<PageResponse<InsumoQuimicoResponse>>("/insumos-quimicos", { params: buildQueryParams(query) })
      .then((r) => r.data),

  listarVencimientos: (dias = 30) =>
    apiClient
      .get<LoteResponse[]>("/insumos-quimicos/vencimientos", { params: buildQueryParams({ dias }) })
      .then((r) => r.data),

  obtener: (id: number) => apiClient.get<InsumoQuimicoResponse>(`/insumos-quimicos/${id}`).then((r) => r.data),

  crear: (payload: CrearInsumoQuimicoRequest) =>
    apiClient.post<InsumoQuimicoResponse>("/insumos-quimicos", payload).then((r) => r.data),

  cambiarEstado: (id: number, payload: CambiarEstadoRequest) =>
    apiClient.patch<InsumoQuimicoResponse>(`/insumos-quimicos/${id}/estado`, payload).then((r) => r.data),

  actualizarPrecioCompra: (id: number, payload: ActualizarPrecioCompraRequest) =>
    apiClient
      .patch<InsumoQuimicoResponse>(`/insumos-quimicos/${id}/precio-compra`, payload)
      .then((r) => r.data),

  listarLotes: (id: number, params: PageQuery) =>
    apiClient
      .get<PageResponse<LoteResponse>>(`/insumos-quimicos/${id}/lotes`, { params: buildQueryParams(params) })
      .then((r) => r.data),

  listarMovimientos: (insumoId: number, params: PageQuery) =>
    apiClient
      .get<PageResponse<MovimientoInsumoResponse>>(`/insumos-quimicos/${insumoId}/movimientos`, {
        params: buildQueryParams(params),
      })
      .then((r) => r.data),

  registrarEntrada: (insumoId: number, payload: RegistrarEntradaInsumoRequest) =>
    apiClient
      .post<MovimientoInsumoResponse>(`/insumos-quimicos/${insumoId}/entradas`, payload)
      .then((r) => r.data),

  registrarSalida: (insumoId: number, payload: RegistrarSalidaInsumoRequest) =>
    apiClient
      .post<MovimientoInsumoResponse>(`/insumos-quimicos/${insumoId}/salidas`, payload)
      .then((r) => r.data),

  eliminar: (id: number, cascada = false) =>
    apiClient
      .delete<void>(`/insumos-quimicos/${id}`, { params: cascada ? { cascada: true } : undefined })
      .then((r) => r.data),

  obtenerDependencias: (id: number) =>
    apiClient.get<DependenciasResponse>(`/insumos-quimicos/${id}/dependencias`).then((r) => r.data),
};
