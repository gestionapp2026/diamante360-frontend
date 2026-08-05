import { apiClient } from "@/lib/api-client";
import type { RolResponse } from "@/types/auth";

export const rolApi = {
  listar: () => apiClient.get<RolResponse[]>("/roles").then((r) => r.data),
};
