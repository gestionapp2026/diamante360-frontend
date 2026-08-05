import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { formulaApi } from "@/features/formulas/api/formula-api";
import { getErrorMessage } from "@/lib/api-client";
import type {
  ActualizarFormulaRequest,
  CambiarEstadoRequest,
  CrearFormulaRequest,
  FormulasQuery,
  ProducirFormulaRequest,
} from "@/features/formulas/types";

export function useFormulas(query: FormulasQuery) {
  return useQuery({
    queryKey: ["formulas", "list", query],
    queryFn: () => formulaApi.listar(query),
  });
}

export function useFormula(id: number | undefined) {
  return useQuery({
    queryKey: ["formulas", "detail", id],
    queryFn: () => formulaApi.obtener(id as number),
    enabled: id !== undefined,
  });
}

export function useFormulaPorProducto(productoId: number | undefined) {
  return useQuery({
    queryKey: ["formulas", "producto", productoId],
    queryFn: () => formulaApi.obtenerPorProducto(productoId as number),
    enabled: productoId !== undefined,
  });
}

export function useCrearFormula() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearFormulaRequest) => formulaApi.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulas", "list"] });
      toast.success("Formula creada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useActualizarFormula(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActualizarFormulaRequest) => formulaApi.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulas", "list"] });
      queryClient.invalidateQueries({ queryKey: ["formulas", "detail", id] });
      toast.success("Formula actualizada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCambiarEstadoFormula(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoRequest) => formulaApi.cambiarEstado(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulas", "list"] });
      queryClient.invalidateQueries({ queryKey: ["formulas", "detail", id] });
      toast.success("Estado de la formula actualizado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useEliminarFormula(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cascada: boolean) => formulaApi.eliminar(id, cascada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulas", "list"] });
      toast.success("Formula eliminada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDependenciasFormula(id: number, opciones: { enabled: boolean } = { enabled: true }) {
  return useQuery({
    queryKey: ["formulas", "dependencias", id],
    queryFn: () => formulaApi.obtenerDependencias(id),
    enabled: opciones.enabled,
  });
}

export function useProducirFormula(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProducirFormulaRequest) => formulaApi.producir(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulas", "detail", id] });
      // El stock de productos/insumos cambia al producir; se refrescan tambien
      // esas vistas si estan abiertas en otra pestana/pagina.
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["inventario"] });
      queryClient.invalidateQueries({ queryKey: ["insumos-quimicos"] });
      toast.success("Produccion registrada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
