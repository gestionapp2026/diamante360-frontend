import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { inventarioApi } from "@/features/inventario/api/inventario-api";
import type { RegistrarMovimientoRequest } from "@/features/inventario/types";
import { getErrorMessage } from "@/lib/api-client";
import type { PageQuery } from "@/types/api";

export function useMovimientos(productoId: number, params: PageQuery) {
  return useQuery({
    queryKey: ["inventario", "movimientos", productoId, params],
    queryFn: () => inventarioApi.listarMovimientos(productoId, params),
    enabled: Number.isFinite(productoId) && productoId > 0,
  });
}

export function useRegistrarMovimiento(productoId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegistrarMovimientoRequest) => inventarioApi.registrarMovimiento(productoId, payload),
    onSuccess: () => {
      toast.success("Movimiento registrado correctamente");
      queryClient.invalidateQueries({ queryKey: ["inventario", "movimientos", productoId] });
      queryClient.invalidateQueries({ queryKey: ["inventario", "producto", productoId] });
      queryClient.invalidateQueries({ queryKey: ["inventario", "productos"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
