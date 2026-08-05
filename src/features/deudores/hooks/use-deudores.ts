import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deudorApi, type ListarDeudoresParams } from "@/features/deudores/api/deudor-api";
import type { RegistrarAbonoRequest } from "@/features/deudores/types";
import { getErrorMessage } from "@/lib/api-client";
import type { PageQuery } from "@/types/api";

export function useDeudores(params: ListarDeudoresParams) {
  return useQuery({
    queryKey: ["deudores", "list", params],
    queryFn: () => deudorApi.listar(params),
  });
}

export function useDeudor(id: number | undefined) {
  return useQuery({
    queryKey: ["deudores", "detail", id],
    queryFn: () => deudorApi.obtener(id as number),
    enabled: id !== undefined,
  });
}

export function useDeudorPorFactura(facturaId: number | undefined) {
  return useQuery({
    queryKey: ["deudores", "por-factura", facturaId],
    queryFn: () => deudorApi.obtenerPorFactura(facturaId as number),
    enabled: facturaId !== undefined,
  });
}

export function useRegistrarAbono(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegistrarAbonoRequest) => deudorApi.registrarAbono(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudores", "list"] });
      queryClient.invalidateQueries({ queryKey: ["deudores", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["deudores", "abonos", id] });
      queryClient.invalidateQueries({ queryKey: ["deudores", "historial", id] });
      toast.success("Abono registrado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAbonos(id: number, params: PageQuery) {
  return useQuery({
    queryKey: ["deudores", "abonos", id, params],
    queryFn: () => deudorApi.listarAbonos(id, params),
    enabled: id !== undefined,
  });
}

export function useHistorialDeudor(id: number, params: PageQuery) {
  return useQuery({
    queryKey: ["deudores", "historial", id, params],
    queryFn: () => deudorApi.listarHistorial(id, params),
    enabled: id !== undefined,
  });
}

export function useSaldoCliente(clienteId: number | undefined) {
  return useQuery({
    queryKey: ["deudores", "saldo", clienteId],
    queryFn: () => deudorApi.obtenerSaldoCliente(clienteId as number),
    enabled: clienteId !== undefined,
  });
}
