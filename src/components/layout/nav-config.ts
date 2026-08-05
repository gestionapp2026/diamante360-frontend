import {
  LayoutDashboard,
  Users,
  MapPinned,
  Package,
  Tags,
  Boxes,
  Beaker,
  FlaskConical,
  Receipt,
  HandCoins,
  ClipboardList,
  UserCog,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PERMISOS } from "@/types/enums";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permiso: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "General",
    items: [{ label: "Panel principal", href: "/", icon: LayoutDashboard, permiso: PERMISOS.DASHBOARD_LEER }],
  },
  {
    label: "Ventas",
    items: [
      { label: "Facturas", href: "/facturas", icon: Receipt, permiso: PERMISOS.FACTURA_LEER },
      { label: "Ordenes", href: "/ordenes", icon: ClipboardList, permiso: PERMISOS.ORDEN_LEER },
      { label: "Deudores", href: "/deudores", icon: HandCoins, permiso: PERMISOS.DEUDOR_LEER },
    ],
  },
  {
    label: "Catalogo",
    items: [
      { label: "Clientes", href: "/clientes", icon: Users, permiso: PERMISOS.CLIENTE_LEER },
      { label: "Rutas", href: "/rutas", icon: MapPinned, permiso: PERMISOS.CLIENTE_LEER },
      { label: "Productos", href: "/productos", icon: Package, permiso: PERMISOS.PRODUCTO_LEER },
      { label: "Categorias", href: "/categorias", icon: Tags, permiso: PERMISOS.PRODUCTO_LEER },
      { label: "Insumos quimicos", href: "/insumos-quimicos", icon: FlaskConical, permiso: PERMISOS.INSUMO_LEER },
    ],
  },
  {
    label: "Operacion",
    items: [
      { label: "Inventario", href: "/inventario", icon: Boxes, permiso: PERMISOS.INVENTARIO_LEER },
      { label: "Formulas", href: "/formulas", icon: Beaker, permiso: PERMISOS.FORMULA_LEER },
    ],
  },
  {
    label: "Administracion",
    items: [
      { label: "Usuarios", href: "/usuarios", icon: UserCog, permiso: PERMISOS.USUARIO_LEER },
      { label: "Roles", href: "/roles", icon: ShieldCheck, permiso: PERMISOS.ROL_GESTIONAR },
    ],
  },
];
