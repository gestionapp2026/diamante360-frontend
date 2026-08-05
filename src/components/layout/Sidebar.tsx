import { NavLink } from "react-router-dom";
import { Gem } from "lucide-react";

import { NAV_GROUPS } from "@/components/layout/nav-config";
import { usePermiso } from "@/hooks/use-permiso";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { puede } = usePermiso();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Gem className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">El Diamante 360</p>
          <p className="text-xs text-sidebar-foreground/60">ERP Carnicos</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => puede(item.permiso));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
