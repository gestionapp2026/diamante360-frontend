import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { facturaApi, type ListarFacturasParams } from "@/features/facturas/api/factura-api";
import { getErrorMessage } from "@/lib/api-client";
import type { PageQuery } from "@/types/api";
import type { CrearFacturaRequest } from "@/features/facturas/types";

export function useFacturas(params: ListarFacturasParams) {
  return useQuery({
    queryKey: ["facturas", "list", params],
    queryFn: () => facturaApi.listar(params),
  });
}

export function useFactura(id: number | undefined) {
  return useQuery({
    queryKey: ["facturas", "detail", id],
    queryFn: () => facturaApi.obtener(id as number),
    enabled: id !== undefined,
  });
}

export function useCrearFactura() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearFacturaRequest) => facturaApi.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas", "list"] });
      toast.success("Factura creada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAnularFactura(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => facturaApi.anular(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas", "list"] });
      queryClient.invalidateQueries({ queryKey: ["facturas", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["facturas", "historial", id] });
      queryClient.invalidateQueries({ queryKey: ["deudores"] });
      toast.success("Factura anulada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useEliminarFactura(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cascada: boolean) => facturaApi.eliminar(id, cascada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas", "list"] });
      queryClient.invalidateQueries({ queryKey: ["deudores"] });
      toast.success("Factura eliminada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDependenciasFactura(id: number, opciones: { enabled: boolean } = { enabled: true }) {
  return useQuery({
    queryKey: ["facturas", "dependencias", id],
    queryFn: () => facturaApi.obtenerDependencias(id),
    enabled: opciones.enabled,
  });
}

export function useHistorialFactura(facturaId: number, params: PageQuery) {
  return useQuery({
    queryKey: ["facturas", "historial", facturaId, params],
    queryFn: () => facturaApi.listarHistorial(facturaId, params),
    enabled: facturaId !== undefined,
  });
}

/** Descarga el PDF de la factura y le pide al navegador que lo abra/guarde con un nombre de archivo legible. */
export function useDescargarFacturaPdf() {
  return useMutation({
    mutationFn: async ({ id, numero }: { id: number; numero: string }) => {
      const blob = await facturaApi.obtenerPdf(id);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `factura-${numero}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
