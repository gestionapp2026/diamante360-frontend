import { apiClient, buildQueryParams } from "@/lib/api-client";
import type { DependenciasResponse, PageResponse } from "@/types/api";
import type {
  ActualizarFormulaRequest,
  CambiarEstadoRequest,
  CrearFormulaRequest,
  FormulaResponse,
  FormulasQuery,
  ProduccionFormulaResponse,
  ProducirFormulaRequest,
} from "@/features/formulas/types";

export const formulaApi = {
  listar: (query: FormulasQuery) =>
    apiClient
      .get<PageResponse<FormulaResponse>>("/formulas", { params: buildQueryParams(query) })
      .then((r) => r.data),

  obtener: (id: number) => apiClient.get<FormulaResponse>(`/formulas/${id}`).then((r) => r.data),

  obtenerPorProducto: (productoId: number) =>
    apiClient.get<FormulaResponse>(`/formulas/producto/${productoId}`).then((r) => r.data),

  crear: (payload: CrearFormulaRequest) => apiClient.post<FormulaResponse>("/formulas", payload).then((r) => r.data),

  actualizar: (id: number, payload: ActualizarFormulaRequest) =>
    apiClient.put<FormulaResponse>(`/formulas/${id}`, payload).then((r) => r.data),

  cambiarEstado: (id: number, payload: CambiarEstadoRequest) =>
    apiClient.patch<FormulaResponse>(`/formulas/${id}/estado`, payload).then((r) => r.data),

  producir: (id: number, payload: ProducirFormulaRequest) =>
    apiClient.post<ProduccionFormulaResponse>(`/formulas/${id}/producir`, payload).then((r) => r.data),

  eliminar: (id: number, cascada = false) =>
    apiClient.delete<void>(`/formulas/${id}`, { params: cascada ? { cascada: true } : undefined }).then((r) => r.data),

  obtenerDependencias: (id: number) =>
    apiClient.get<DependenciasResponse>(`/formulas/${id}/dependencias`).then((r) => r.data),
};
