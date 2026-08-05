import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { clienteApi, type ListarClientesParams } from "@/features/clientes/api/cliente-api";
import { getErrorMessage } from "@/lib/api-client";
import type { PageQuery } from "@/types/api";
import type {
  ActualizarClienteRequest,
  AsignarRutaRequest,
  CambiarEstadoRequest,
  CrearClienteRequest,
  EstablecerPrecioClienteProductoRequest,
  RegistrarObservacionRequest,
} from "@/features/clientes/types";

export function useClientes(params: ListarClientesParams) {
  return useQuery({
    queryKey: ["clientes", "list", params],
    queryFn: () => clienteApi.listar(params),
  });
}

export function useCliente(id: number | undefined) {
  return useQuery({
    queryKey: ["clientes", "detail", id],
    queryFn: () => clienteApi.obtener(id as number),
    enabled: id !== undefined,
  });
}

export function useCrearCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearClienteRequest) => clienteApi.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes", "list"] });
      toast.success("Cliente creado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useActualizarCliente(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActualizarClienteRequest) => clienteApi.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes", "list"] });
      queryClient.invalidateQueries({ queryKey: ["clientes", "detail", id] });
      toast.success("Cliente actualizado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCambiarEstadoCliente(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoRequest) => clienteApi.cambiarEstado(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes", "list"] });
      queryClient.invalidateQueries({ queryKey: ["clientes", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["clientes", "historial", id] });
      toast.success("Estado del cliente actualizado");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAsignarRutaCliente(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AsignarRutaRequest) => clienteApi.asignarRuta(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes", "list"] });
      queryClient.invalidateQueries({ queryKey: ["clientes", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["clientes", "historial", id] });
      toast.success("Ruta asignada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useObservacionesCliente(clienteId: number, params: PageQuery) {
  return useQuery({
    queryKey: ["clientes", "observaciones", clienteId, params],
    queryFn: () => clienteApi.listarObservaciones(clienteId, params),
    enabled: clienteId !== undefined,
  });
}

export function useRegistrarObservacion(clienteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegistrarObservacionRequest) => clienteApi.registrarObservacion(clienteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes", "observaciones", clienteId] });
      toast.success("Observacion registrada correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useHistorialCliente(clienteId: number, params: PageQuery) {
  return useQuery({
    queryKey: ["clientes", "historial", clienteId, params],
    queryFn: () => clienteApi.listarHistorial(clienteId, params),
    enabled: clienteId !== undefined,
  });
}

export function usePreciosCliente(clienteId: number | undefined, params: PageQuery) {
  return useQuery({
    queryKey: ["clientes", "precios", clienteId, params],
    queryFn: () => clienteApi.listarPrecios(clienteId as number, params),
    enabled: !!clienteId,
  });
}

export function useEstablecerPrecioCliente(clienteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EstablecerPrecioClienteProductoRequest) => clienteApi.establecerPrecio(clienteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes", "precios", clienteId] });
      toast.success("Precio establecido correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useEliminarPrecioCliente(clienteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (precioId: number) => clienteApi.eliminarPrecio(clienteId, precioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes", "precios", clienteId] });
      toast.success("Precio eliminado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useEliminarCliente(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cascada: boolean) => clienteApi.eliminar(id, cascada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes", "list"] });
      toast.success("Cliente eliminado correctamente");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDependenciasCliente(id: number, opciones: { enabled: boolean } = { enabled: true }) {
  return useQuery({
    queryKey: ["clientes", "dependencias", id],
    queryFn: () => clienteApi.obtenerDependencias(id),
    enabled: opciones.enabled,
  });
}
