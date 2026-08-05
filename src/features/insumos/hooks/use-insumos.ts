import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { insumoApi } from "@/features/insumos/api/insumo-api";
import { getErrorMessage } from "@/lib/api-client";
import type { PageQuery } from "@/types/api";
import type {
  ActualizarPrecioCompraRequest,
  CambiarEstadoRequest,
  CrearInsumoQuimicoRequest,
  InsumosQuimicosQuery,
  RegistrarEntradaInsumoRequest,
  RegistrarSalidaInsumoRequest,
} from "@/features/insumos/types";

export function useInsumosQuimicos(query: InsumosQuimicosQuery) {
  return useQuery({
    queryKey: ["insumos-quimicos", "list", query],
    queryFn: () => insumoApi.listar(query),
  });
}

export function useInsumoQuimico(id: number | undefined) {
  return useQuery({
    queryKey: ["insumos-quimicos", "detail", id],
    queryFn: () => insumoApi.obtener(id as number),
    enabled: id !== undefined,
  });
}

export function useLotesPorVencer(dias = 30) {
  return useQuery({
    queryKey: ["insumos-quimicos", "vencimientos", dias],
    queryFn: () => insumoApi.listarVencimientos(dias),
  });
}

export function useLotesPorInsumo(insumoId: number | undefined, params: PageQuery) {
  return useQuery({
    queryKey: ["insumos-quimicos", "lotes", insumoId, params],
    queryFn: () => insumoApi.listarLotes(insumoId as number, params),
    enabled: insumoId !== undefined,
  });
}

export function useMovimientosPorInsumo(insumoId: number | undefined, params: PageQuery) {
  return useQuery({
    queryKey: ["insumos-quimicos", "movimientos", insumoId, params],
    queryFn: () => insumoApi.listarMovimientos(insumoId as number, params),
    enabled: insumoId !== undefined,
  });
}

export function useCrearInsumoQuimico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearInsumoQuimicoRequest) => insumoApi.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "list"] });
      toast.success("Insumo creado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCambiarEstadoInsumoQuimico(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoRequest) => insumoApi.cambiarEstado(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "detail", id] });
      toast.success("Estado del insumo actualizado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useActualizarPrecioCompraInsumo(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActualizarPrecioCompraRequest) => insumoApi.actualizarPrecioCompra(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "detail", id] });
      toast.success("Precio de compra actualizado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRegistrarEntradaInsumo(insumoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegistrarEntradaInsumoRequest) => insumoApi.registrarEntrada(insumoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "detail", insumoId] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "lotes", insumoId] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "movimientos", insumoId] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "vencimientos"] });
      toast.success("Entrada registrada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRegistrarSalidaInsumo(insumoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegistrarSalidaInsumoRequest) => insumoApi.registrarSalida(insumoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "detail", insumoId] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "lotes", insumoId] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "movimientos", insumoId] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "vencimientos"] });
      toast.success("Salida registrada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useEliminarInsumoQuimico(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cascada: boolean) => insumoApi.eliminar(id, cascada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "list"] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos", "vencimientos"] });
      toast.success("Insumo eliminado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDependenciasInsumoQuimico(id: number, opciones: { enabled: boolean } = { enabled: true }) {
  return useQuery({
    queryKey: ["insumos-quimicos", "dependencias", id],
    queryFn: () => insumoApi.obtenerDependencias(id),
    enabled: opciones.enabled,
  });
}
