import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

interface RequirePermissionProps {
  permiso: string | string[];
  children: ReactNode;
}

/** Bloquea el acceso a una ruta si el usuario no tiene el permiso (o ninguno de los permisos) requerido. */
export function RequirePermission({ permiso, children }: RequirePermissionProps) {
  const hasAnyPermiso = useAuthStore((s) => s.hasAnyPermiso);
  const permisos = Array.isArray(permiso) ? permiso : [permiso];

  if (!hasAnyPermiso(permisos)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
