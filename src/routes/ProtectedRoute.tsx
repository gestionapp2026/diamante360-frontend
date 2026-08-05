import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

/** Exige sesion activa; si el usuario debe cambiar su contrasena, lo redirige antes de dejarlo pasar. */
export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const debeCambiarPassword = useAuthStore((s) => s.usuario?.debeCambiarPassword);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (debeCambiarPassword && location.pathname !== "/cambiar-password") {
    return <Navigate to="/cambiar-password" replace />;
  }

  if (!debeCambiarPassword && location.pathname === "/cambiar-password") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
