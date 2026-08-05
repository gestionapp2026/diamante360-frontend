import { apiClient, buildQueryParams } from "@/lib/api-client";
import type { PageQuery, PageResponse } from "@/types/api";
import type { MovimientoResponse, ProductoResumen, RegistrarMovimientoRequest } from "@/features/inventario/types";

export const inventarioApi = {
  listarProductos: (params: PageQuery) =>
    apiClient
      .get<PageResponse<ProductoResumen>>("/productos", { params: buildQueryParams(params) })
      .then((r) => r.data),

  obtenerProducto: (id: number) => apiClient.get<ProductoResumen>(`/productos/${id}`).then((r) => r.data),

  listarMovimientos: (productoId: number, params: PageQuery) =>
    apiClient
      .get<PageResponse<MovimientoResponse>>(`/productos/${productoId}/movimientos`, {
        params: buildQueryParams(params),
      })
      .then((r) => r.data),

  registrarMovimiento: (productoId: number, payload: RegistrarMovimientoRequest) =>
    apiClient
      .post<MovimientoResponse>(`/productos/${productoId}/movimientos`, payload)
      .then((r) => r.data),
};
