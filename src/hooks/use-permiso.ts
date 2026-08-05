import { useAuthStore } from "@/stores/auth-store";

/** Hook de conveniencia para gatear botones/acciones en la UI segun los permisos del JWT. */
export function usePermiso() {
  const hasPermiso = useAuthStore((s) => s.hasPermiso);
  const hasAnyPermiso = useAuthStore((s) => s.hasAnyPermiso);
  const usuario = useAuthStore((s) => s.usuario);

  return {
    puede: hasPermiso,
    puedeAlguno: hasAnyPermiso,
    rol: usuario?.rol,
    esAdmin: usuario?.rol === "ADMIN",
  };
}
