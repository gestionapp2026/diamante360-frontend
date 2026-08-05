import { apiClient } from "@/lib/api-client";
import type { DependenciasResponse } from "@/types/api";
import type {
  ActualizarCategoriaRequest,
  CambiarEstadoRequest,
  CategoriaResponse,
  CrearCategoriaRequest,
} from "@/features/productos/types";

export const categoriaApi = {
  listar: () => apiClient.get<CategoriaResponse[]>("/categorias").then((r) => r.data),

  crear: (payload: CrearCategoriaRequest) =>
    apiClient.post<CategoriaResponse>("/categorias", payload).then((r) => r.data),

  actualizar: (id: number, payload: ActualizarCategoriaRequest) =>
    apiClient.put<CategoriaResponse>(`/categorias/${id}`, payload).then((r) => r.data),

  cambiarEstado: (id: number, payload: CambiarEstadoRequest) =>
    apiClient.patch<CategoriaResponse>(`/categorias/${id}/estado`, payload).then((r) => r.data),

  eliminar: (id: number, cascada = false) =>
    apiClient.delete<void>(`/categorias/${id}`, { params: cascada ? { cascada: true } : undefined }).then((r) => r.data),

  obtenerDependencias: (id: number) =>
    apiClient.get<DependenciasResponse>(`/categorias/${id}/dependencias`).then((r) => r.data),
};
