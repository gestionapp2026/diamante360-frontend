import { apiClient } from "@/lib/api-client";
import type {
  CambiarPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  TokenResponse,
  UsuarioSesionResponse,
} from "@/types/auth";

export const authApi = {
  login: (payload: LoginRequest) => apiClient.post<TokenResponse>("/auth/login", payload).then((r) => r.data),

  refresh: (payload: RefreshTokenRequest) =>
    apiClient.post<TokenResponse>("/auth/refresh", payload).then((r) => r.data),

  logout: (payload: RefreshTokenRequest) => apiClient.post<void>("/auth/logout", payload).then((r) => r.data),

  me: () => apiClient.get<UsuarioSesionResponse>("/auth/me").then((r) => r.data),

  cambiarMiPassword: (payload: CambiarPasswordRequest) =>
    apiClient.patch<void>("/usuarios/me/password", payload).then((r) => r.data),
};
