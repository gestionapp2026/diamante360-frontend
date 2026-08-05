import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RequirePermission } from "@/routes/RequirePermission";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { CambiarPasswordPage } from "@/features/auth/pages/CambiarPasswordPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PERMISOS } from "@/types/enums";

const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));

const ClientesListPage = lazy(() => import("@/features/clientes/pages/ClientesListPage").then((m) => ({ default: m.ClientesListPage })));
const ClienteDetailPage = lazy(() => import("@/features/clientes/pages/ClienteDetailPage").then((m) => ({ default: m.ClienteDetailPage })));
const RutasListPage = lazy(() => import("@/features/clientes/pages/RutasListPage").then((m) => ({ default: m.RutasListPage })));

const ProductosListPage = lazy(() => import("@/features/productos/pages/ProductosListPage").then((m) => ({ default: m.ProductosListPage })));
const ProductoDetailPage = lazy(() => import("@/features/productos/pages/ProductoDetailPage").then((m) => ({ default: m.ProductoDetailPage })));
const CategoriasListPage = lazy(() => import("@/features/productos/pages/CategoriasListPage").then((m) => ({ default: m.CategoriasListPage })));

const InventarioPage = lazy(() => import("@/features/inventario/pages/InventarioPage").then((m) => ({ default: m.InventarioPage })));
const KardexPage = lazy(() => import("@/features/inventario/pages/KardexPage").then((m) => ({ default: m.KardexPage })));

const InsumosListPage = lazy(() => import("@/features/insumos/pages/InsumosListPage").then((m) => ({ default: m.InsumosListPage })));
const InsumoDetailPage = lazy(() => import("@/features/insumos/pages/InsumoDetailPage").then((m) => ({ default: m.InsumoDetailPage })));

const FormulasListPage = lazy(() => import("@/features/formulas/pages/FormulasListPage").then((m) => ({ default: m.FormulasListPage })));
const NuevaFormulaPage = lazy(() => import("@/features/formulas/pages/NuevaFormulaPage").then((m) => ({ default: m.NuevaFormulaPage })));
const FormulaDetailPage = lazy(() => import("@/features/formulas/pages/FormulaDetailPage").then((m) => ({ default: m.FormulaDetailPage })));

const FacturasListPage = lazy(() => import("@/features/facturas/pages/FacturasListPage").then((m) => ({ default: m.FacturasListPage })));
const NuevaFacturaPage = lazy(() => import("@/features/facturas/pages/NuevaFacturaPage").then((m) => ({ default: m.NuevaFacturaPage })));
const FacturaDetailPage = lazy(() => import("@/features/facturas/pages/FacturaDetailPage").then((m) => ({ default: m.FacturaDetailPage })));

const OrdenesListPage = lazy(() => import("@/features/ordenes/pages/OrdenesListPage").then((m) => ({ default: m.OrdenesListPage })));
const NuevaOrdenPage = lazy(() => import("@/features/ordenes/pages/NuevaOrdenPage").then((m) => ({ default: m.NuevaOrdenPage })));
const OrdenDetailPage = lazy(() => import("@/features/ordenes/pages/OrdenDetailPage").then((m) => ({ default: m.OrdenDetailPage })));

const DeudoresListPage = lazy(() => import("@/features/deudores/pages/DeudoresListPage").then((m) => ({ default: m.DeudoresListPage })));
const DeudorDetailPage = lazy(() => import("@/features/deudores/pages/DeudorDetailPage").then((m) => ({ default: m.DeudorDetailPage })));

const UsuariosListPage = lazy(() => import("@/features/usuarios/pages/UsuariosListPage").then((m) => ({ default: m.UsuariosListPage })));
const RolesListPage = lazy(() => import("@/features/usuarios/pages/RolesListPage").then((m) => ({ default: m.RolesListPage })));

function PageFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function withPermiso(permiso: string, element: React.ReactNode) {
  return <RequirePermission permiso={permiso}>{element}</RequirePermission>;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cambiar-password" element={<CambiarPasswordPage />} />

          <Route element={<DashboardLayout />}>
            <Route path="/" element={withPermiso(PERMISOS.DASHBOARD_LEER, <DashboardPage />)} />

            <Route path="/clientes" element={withPermiso(PERMISOS.CLIENTE_LEER, <ClientesListPage />)} />
            <Route path="/clientes/:id" element={withPermiso(PERMISOS.CLIENTE_LEER, <ClienteDetailPage />)} />
            <Route path="/rutas" element={withPermiso(PERMISOS.CLIENTE_LEER, <RutasListPage />)} />

            <Route path="/productos" element={withPermiso(PERMISOS.PRODUCTO_LEER, <ProductosListPage />)} />
            <Route path="/productos/:id" element={withPermiso(PERMISOS.PRODUCTO_LEER, <ProductoDetailPage />)} />
            <Route path="/categorias" element={withPermiso(PERMISOS.PRODUCTO_LEER, <CategoriasListPage />)} />

            <Route path="/inventario" element={withPermiso(PERMISOS.INVENTARIO_LEER, <InventarioPage />)} />
            <Route path="/productos/:id/movimientos" element={withPermiso(PERMISOS.INVENTARIO_LEER, <KardexPage />)} />

            <Route path="/insumos-quimicos" element={withPermiso(PERMISOS.INSUMO_LEER, <InsumosListPage />)} />
            <Route path="/insumos-quimicos/:id" element={withPermiso(PERMISOS.INSUMO_LEER, <InsumoDetailPage />)} />

            <Route path="/formulas" element={withPermiso(PERMISOS.FORMULA_LEER, <FormulasListPage />)} />
            <Route path="/formulas/nueva" element={withPermiso(PERMISOS.FORMULA_CREAR, <NuevaFormulaPage />)} />
            <Route path="/formulas/:id" element={withPermiso(PERMISOS.FORMULA_LEER, <FormulaDetailPage />)} />

            <Route path="/facturas" element={withPermiso(PERMISOS.FACTURA_LEER, <FacturasListPage />)} />
            <Route path="/facturas/nueva" element={withPermiso(PERMISOS.FACTURA_CREAR, <NuevaFacturaPage />)} />
            <Route path="/facturas/:id" element={withPermiso(PERMISOS.FACTURA_LEER, <FacturaDetailPage />)} />

            <Route path="/ordenes" element={withPermiso(PERMISOS.ORDEN_LEER, <OrdenesListPage />)} />
            <Route path="/ordenes/nueva" element={withPermiso(PERMISOS.ORDEN_CREAR, <NuevaOrdenPage />)} />
            <Route path="/ordenes/:id" element={withPermiso(PERMISOS.ORDEN_LEER, <OrdenDetailPage />)} />

            <Route path="/deudores" element={withPermiso(PERMISOS.DEUDOR_LEER, <DeudoresListPage />)} />
            <Route path="/deudores/:id" element={withPermiso(PERMISOS.DEUDOR_LEER, <DeudorDetailPage />)} />

            <Route path="/usuarios" element={withPermiso(PERMISOS.USUARIO_LEER, <UsuariosListPage />)} />
            <Route path="/roles" element={withPermiso(PERMISOS.ROL_GESTIONAR, <RolesListPage />)} />

            <Route path="/403" element={<ForbiddenPage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
