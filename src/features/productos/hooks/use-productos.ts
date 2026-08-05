import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { productoApi } from "@/features/productos/api/producto-api";
import { getErrorMessage } from "@/lib/api-client";
import type { PageQuery } from "@/types/api";
import type { ActualizarProductoRequest, CambiarEstadoRequest, CrearProductoRequest } from "@/features/productos/types";

export function useProductos(params: PageQuery) {
  return useQuery({
    queryKey: ["productos", "list", params],
    queryFn: () => productoApi.listar(params),
  });
}

export function useProductosStockBajo() {
  return useQuery({
    queryKey: ["productos", "stock-bajo"],
    queryFn: () => productoApi.listarStockBajo(),
  });
}

export function useProducto(id: number | undefined) {
  return useQuery({
    queryKey: ["productos", "detail", id],
    queryFn: () => productoApi.obtener(id as number),
    enabled: id !== undefined,
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearProductoRequest) => productoApi.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["productos", "stock-bajo"] });
      toast.success("Producto creado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useActualizarProducto(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActualizarProductoRequest) => productoApi.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["productos", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["productos", "stock-bajo"] });
      toast.success("Producto actualizado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCambiarEstadoProducto(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoRequest) => productoApi.cambiarEstado(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["productos", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["productos", "stock-bajo"] });
      toast.success("Estado del producto actualizado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useEliminarProducto(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cascada: boolean) => productoApi.eliminar(id, cascada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["productos", "stock-bajo"] });
      toast.success("Producto eliminado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDependenciasProducto(id: number, opciones: { enabled: boolean } = { enabled: true }) {
  return useQuery({
    queryKey: ["productos", "dependencias", id],
    queryFn: () => productoApi.obtenerDependencias(id),
    enabled: opciones.enabled,
  });
}
