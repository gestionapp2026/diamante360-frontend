import { useQuery } from "@tanstack/react-query";

import { inventarioApi } from "@/features/inventario/api/inventario-api";
import type { PageQuery } from "@/types/api";

export function useProductos(params: PageQuery) {
  return useQuery({
    queryKey: ["inventario", "productos", params],
    queryFn: () => inventarioApi.listarProductos(params),
  });
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: ["inventario", "producto", id],
    queryFn: () => inventarioApi.obtenerProducto(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
