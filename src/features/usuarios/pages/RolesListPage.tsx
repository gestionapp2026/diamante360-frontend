import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { useRoles } from "@/features/usuarios/hooks/use-roles";

export function RolesListPage() {
  const { data: roles, isLoading } = useRoles();

  return (
    <div className="space-y-6">
      <PageHeader title="Roles" description="Consulta los roles del sistema y sus permisos asignados." />

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles?.map((rol) => (
            <Card key={rol.id}>
              <CardHeader>
                <CardTitle>{rol.nombre}</CardTitle>
                {rol.descripcion && <CardDescription>{rol.descripcion}</CardDescription>}
              </CardHeader>
              <CardContent>
                {rol.permisos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin permisos asignados</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {rol.permisos.map((permiso) => (
                      <Badge key={permiso} variant="outline">
                        {permiso}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
