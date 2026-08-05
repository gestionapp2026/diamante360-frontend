import { apiClient, buildQueryParams } from "@/lib/api-client";
import type { DependenciasResponse, PageQuery, PageResponse } from "@/types/api";
import type {
  ActualizarProductoRequest,
  CambiarEstadoRequest,
  CrearProductoRequest,
  ProductoResponse,
} from "@/features/productos/types";

export const productoApi = {
  listar: (query: PageQuery) =>
    apiClient
      .get<PageResponse<ProductoResponse>>("/productos", { params: buildQueryParams(query) })
      .then((r) => r.data),

  listarStockBajo: () => apiClient.get<ProductoResponse[]>("/productos/stock-bajo").then((r) => r.data),

  obtener: (id: number) => apiClient.get<ProductoResponse>(`/productos/${id}`).then((r) => r.data),

  crear: (payload: CrearProductoRequest) =>
    apiClient.post<ProductoResponse>("/productos", payload).then((r) => r.data),

  actualizar: (id: number, payload: ActualizarProductoRequest) =>
    apiClient.put<ProductoResponse>(`/productos/${id}`, payload).then((r) => r.data),

  cambiarEstado: (id: number, payload: CambiarEstadoRequest) =>
    apiClient.patch<ProductoResponse>(`/productos/${id}/estado`, payload).then((r) => r.data),

  eliminar: (id: number, cascada = false) =>
    apiClient.delete<void>(`/productos/${id}`, { params: cascada ? { cascada: true } : undefined }).then((r) => r.data),

  obtenerDependencias: (id: number) =>
    apiClient.get<DependenciasResponse>(`/productos/${id}/dependencias`).then((r) => r.data),
};
