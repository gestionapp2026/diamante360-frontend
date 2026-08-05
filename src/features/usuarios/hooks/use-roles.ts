import { useQuery } from "@tanstack/react-query";

import { rolApi } from "@/features/usuarios/api/rol-api";

export function useRoles() {
  return useQuery({
    queryKey: ["roles", "list"],
    queryFn: () => rolApi.listar(),
  });
}
