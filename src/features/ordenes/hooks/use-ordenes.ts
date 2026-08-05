import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ordenApi } from "@/features/ordenes/api/orden-api";
import { getErrorMessage } from "@/lib/api-client";
import type { CrearOrdenRequest, OrdenFiltros } from "@/features/ordenes/types";

export function useOrdenes(filtros: OrdenFiltros) {
  return useQuery({
    queryKey: ["ordenes", "list", filtros],
    queryFn: () => ordenApi.listar(filtros),
  });
}

export function useOrden(id: number | undefined) {
  return useQuery({
    queryKey: ["ordenes", "detail", id],
    queryFn: () => ordenApi.obtener(id as number),
    enabled: id !== undefined,
  });
}

export function useCrearOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearOrdenRequest) => ordenApi.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordenes", "list"] });
      toast.success("Orden creada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDespacharOrden(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ordenApi.despachar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordenes", "list"] });
      queryClient.invalidateQueries({ queryKey: ["ordenes", "detail", id] });
      toast.success("Orden despachada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAnularOrden(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ordenApi.anular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordenes", "list"] });
      queryClient.invalidateQueries({ queryKey: ["ordenes", "detail", id] });
      toast.success("Orden anulada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useEliminarOrden(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cascada: boolean) => ordenApi.eliminar(id, cascada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordenes", "list"] });
      toast.success("Orden eliminada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDependenciasOrden(id: number, opciones: { enabled: boolean } = { enabled: true }) {
  return useQuery({
    queryKey: ["ordenes", "dependencias", id],
    queryFn: () => ordenApi.obtenerDependencias(id),
    enabled: opciones.enabled,
  });
}
