import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">No tienes permisos para ver esta pagina</h1>
        <p className="text-sm text-muted-foreground">
          Si crees que esto es un error, contacta a un administrador del sistema.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Volver al panel principal</Link>
      </Button>
    </div>
  );
}
