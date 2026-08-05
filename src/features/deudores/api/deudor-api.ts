import { apiClient, buildQueryParams } from "@/lib/api-client";
import type { PageResponse, PageQuery } from "@/types/api";
import type { EstadoCuentaPorCobrar } from "@/types/enums";
import type {
  AbonoResponse,
  CuentaPorCobrarResponse,
  HistorialCuentaPorCobrarResponse,
  RegistrarAbonoRequest,
  SaldoClienteResponse,
} from "@/features/deudores/types";

export interface ListarDeudoresParams extends PageQuery {
  clienteId?: number;
  estado?: EstadoCuentaPorCobrar;
}

export const deudorApi = {
  listar: (params: ListarDeudoresParams) =>
    apiClient
      .get<PageResponse<CuentaPorCobrarResponse>>("/deudores", { params: buildQueryParams(params) })
      .then((r) => r.data),

  obtener: (id: number) => apiClient.get<CuentaPorCobrarResponse>(`/deudores/${id}`).then((r) => r.data),

  obtenerPorFactura: (facturaId: number) =>
    apiClient.get<CuentaPorCobrarResponse>(`/deudores/factura/${facturaId}`).then((r) => r.data),

  registrarAbono: (id: number, payload: RegistrarAbonoRequest) =>
    apiClient.post<AbonoResponse>(`/deudores/${id}/abonos`, payload).then((r) => r.data),

  listarAbonos: (id: number, params: PageQuery) =>
    apiClient
      .get<PageResponse<AbonoResponse>>(`/deudores/${id}/abonos`, { params: buildQueryParams(params) })
      .then((r) => r.data),

  listarHistorial: (id: number, params: PageQuery) =>
    apiClient
      .get<PageResponse<HistorialCuentaPorCobrarResponse>>(`/deudores/${id}/historial`, {
        params: buildQueryParams(params),
      })
      .then((r) => r.data),

  obtenerSaldoCliente: (clienteId: number) =>
    apiClient.get<SaldoClienteResponse>(`/deudores/clientes/${clienteId}/saldo`).then((r) => r.data),
};
