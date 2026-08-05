import { apiClient, buildQueryParams } from "@/lib/api-client";
import type { DependenciasResponse, PageResponse } from "@/types/api";
import type {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  RestablecerPasswordResponse,
  UsuarioResponse,
} from "@/types/auth";
import type { CambiarEstadoUsuarioRequest, ListarUsuariosParams } from "@/features/usuarios/types";

export const usuarioApi = {
  listar: (params: ListarUsuariosParams) =>
    apiClient
      .get<PageResponse<UsuarioResponse>>("/usuarios", { params: buildQueryParams(params) })
      .then((r) => r.data),

  obtener: (id: number) => apiClient.get<UsuarioResponse>(`/usuarios/${id}`).then((r) => r.data),

  crear: (payload: CrearUsuarioRequest) =>
    apiClient.post<UsuarioResponse>("/usuarios", payload).then((r) => r.data),

  actualizar: (id: number, payload: ActualizarUsuarioRequest) =>
    apiClient.put<UsuarioResponse>(`/usuarios/${id}`, payload).then((r) => r.data),

  cambiarEstado: (id: number, payload: CambiarEstadoUsuarioRequest) =>
    apiClient.patch<UsuarioResponse>(`/usuarios/${id}/estado`, payload).then((r) => r.data),

  restablecerPassword: (id: number) =>
    apiClient.patch<RestablecerPasswordResponse>(`/usuarios/${id}/password`).then((r) => r.data),

  eliminar: (id: number, cascada = false) =>
    apiClient.delete<void>(`/usuarios/${id}`, { params: cascada ? { cascada: true } : undefined }).then((r) => r.data),

  obtenerDependencias: (id: number) =>
    apiClient.get<DependenciasResponse>(`/usuarios/${id}/dependencias`).then((r) => r.data),
};
