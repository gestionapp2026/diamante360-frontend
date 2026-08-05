import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { rutaApi } from "@/features/clientes/api/ruta-api";
import { getErrorMessage } from "@/lib/api-client";
import type { PageQuery } from "@/types/api";
import type { ActualizarRutaRequest, CambiarEstadoRequest, CrearRutaRequest } from "@/features/clientes/types";

export function useRutas() {
  return useQuery({
    queryKey: ["rutas", "list"],
    queryFn: () => rutaApi.listar(),
  });
}

export function useRuta(id: number | undefined) {
  return useQuery({
    queryKey: ["rutas", "detail", id],
    queryFn: () => rutaApi.obtener(id as number),
    enabled: id !== undefined,
  });
}

export function useCrearRuta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearRutaRequest) => rutaApi.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rutas", "list"] });
      toast.success("Ruta creada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useActualizarRuta(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActualizarRutaRequest) => rutaApi.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rutas", "list"] });
      queryClient.invalidateQueries({ queryKey: ["rutas", "detail", id] });
      toast.success("Ruta actualizada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCambiarEstadoRuta(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoRequest) => rutaApi.cambiarEstado(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rutas", "list"] });
      queryClient.invalidateQueries({ queryKey: ["rutas", "detail", id] });
      toast.success("Estado de la ruta actualizado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useClientesPorRuta(rutaId: number | undefined, params: PageQuery) {
  return useQuery({
    queryKey: ["rutas", "clientes", rutaId, params],
    queryFn: () => rutaApi.listarClientes(rutaId as number, params),
    enabled: rutaId !== undefined,
  });
}

export function useEliminarRuta(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cascada: boolean) => rutaApi.eliminar(id, cascada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rutas", "list"] });
      toast.success("Ruta eliminada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDependenciasRuta(id: number, opciones: { enabled: boolean } = { enabled: true }) {
  return useQuery({
    queryKey: ["rutas", "dependencias", id],
    queryFn: () => rutaApi.obtenerDependencias(id),
    enabled: opciones.enabled,
  });
}
