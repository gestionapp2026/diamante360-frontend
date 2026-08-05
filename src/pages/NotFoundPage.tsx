import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Pagina no encontrada</h1>
        <p className="text-sm text-muted-foreground">La ruta que buscas no existe o fue movida.</p>
      </div>
      <Button asChild>
        <Link to="/">Volver al panel principal</Link>
      </Button>
    </div>
  );
}
