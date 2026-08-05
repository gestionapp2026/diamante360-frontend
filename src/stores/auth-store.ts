import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TokenResponse, UsuarioSesionResponse } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: UsuarioSesionResponse | null;
  setSession: (token: TokenResponse) => void;
  updateUsuario: (usuario: UsuarioSesionResponse) => void;
  clearSession: () => void;
  hasPermiso: (permiso: string) => boolean;
  hasAnyPermiso: (permisos: string[]) => boolean;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,

      setSession: (token) =>
        set({
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          usuario: token.usuario,
        }),

      updateUsuario: (usuario) => set({ usuario }),

      clearSession: () => set({ accessToken: null, refreshToken: null, usuario: null }),

      hasPermiso: (permiso) => get().usuario?.permisos.includes(permiso) ?? false,

      hasAnyPermiso: (permisos) => {
        const actuales = get().usuario?.permisos ?? [];
        return permisos.some((p) => actuales.includes(p));
      },

      isAuthenticated: () => Boolean(get().accessToken && get().usuario),
    }),
    {
      name: "eldiamante360-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        usuario: state.usuario,
      }),
    },
  ),
);
