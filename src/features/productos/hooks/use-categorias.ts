import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { categoriaApi } from "@/features/productos/api/categoria-api";
import { getErrorMessage } from "@/lib/api-client";
import type {
  ActualizarCategoriaRequest,
  CambiarEstadoRequest,
  CrearCategoriaRequest,
} from "@/features/productos/types";

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias", "list"],
    queryFn: () => categoriaApi.listar(),
  });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearCategoriaRequest) => categoriaApi.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias", "list"] });
      toast.success("Categoria creada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useActualizarCategoria(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActualizarCategoriaRequest) => categoriaApi.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias", "list"] });
      toast.success("Categoria actualizada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCambiarEstadoCategoria(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoRequest) => categoriaApi.cambiarEstado(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias", "list"] });
      queryClient.invalidateQueries({ queryKey: ["productos", "list"] });
      toast.success("Estado de la categoria actualizado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useEliminarCategoria(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cascada: boolean) => categoriaApi.eliminar(id, cascada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias", "list"] });
      queryClient.invalidateQueries({ queryKey: ["productos", "list"] });
      toast.success("Categoria eliminada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDependenciasCategoria(id: number, opciones: { enabled: boolean } = { enabled: true }) {
  return useQuery({
    queryKey: ["categorias", "dependencias", id],
    queryFn: () => categoriaApi.obtenerDependencias(id),
    enabled: opciones.enabled,
  });
}
