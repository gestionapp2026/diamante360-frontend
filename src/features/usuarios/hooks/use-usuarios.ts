import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { usuarioApi } from "@/features/usuarios/api/usuario-api";
import type { CambiarEstadoUsuarioRequest, ListarUsuariosParams } from "@/features/usuarios/types";
import { getErrorMessage } from "@/lib/api-client";
import type { ActualizarUsuarioRequest, CrearUsuarioRequest } from "@/types/auth";

export function useUsuarios(params: ListarUsuariosParams) {
  return useQuery({
    queryKey: ["usuarios", "list", params],
    queryFn: () => usuarioApi.listar(params),
  });
}

export function useUsuario(id: number | undefined) {
  return useQuery({
    queryKey: ["usuarios", "detail", id],
    queryFn: () => usuarioApi.obtener(id as number),
    enabled: id !== undefined,
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearUsuarioRequest) => usuarioApi.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios", "list"] });
      toast.success("Usuario creado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useActualizarUsuario(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActualizarUsuarioRequest) => usuarioApi.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios", "list"] });
      queryClient.invalidateQueries({ queryKey: ["usuarios", "detail", id] });
      toast.success("Usuario actualizado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCambiarEstadoUsuario(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoUsuarioRequest) => usuarioApi.cambiarEstado(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios", "list"] });
      queryClient.invalidateQueries({ queryKey: ["usuarios", "detail", id] });
      toast.success("Estado del usuario actualizado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRestablecerPasswordUsuario(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => usuarioApi.restablecerPassword(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios", "list"] });
      queryClient.invalidateQueries({ queryKey: ["usuarios", "detail", id] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useEliminarUsuario(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cascada: boolean) => usuarioApi.eliminar(id, cascada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios", "list"] });
      toast.success("Usuario eliminado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDependenciasUsuario(id: number, opciones: { enabled: boolean } = { enabled: true }) {
  return useQuery({
    queryKey: ["usuarios", "dependencias", id],
    queryFn: () => usuarioApi.obtenerDependencias(id),
    enabled: opciones.enabled,
  });
}
