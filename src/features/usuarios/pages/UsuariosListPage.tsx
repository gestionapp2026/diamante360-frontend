import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { EliminarConDependenciasButton } from "@/components/common/EliminarConDependenciasButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, activoTone } from "@/components/common/StatusBadge";
import { CrearUsuarioDialog } from "@/features/usuarios/components/CrearUsuarioDialog";
import { EditarUsuarioDialog } from "@/features/usuarios/components/EditarUsuarioDialog";
import { RestablecerPasswordDialog } from "@/features/usuarios/components/RestablecerPasswordDialog";
import {
  useCambiarEstadoUsuario,
  useDependenciasUsuario,
  useEliminarUsuario,
  useUsuarios,
} from "@/features/usuarios/hooks/use-usuarios";
import { usePermiso } from "@/hooks/use-permiso";
import { formatDateTime } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISOS } from "@/types/enums";
import type { UsuarioResponse } from "@/types/auth";

function EliminarUsuarioAction({ usuario }: { usuario: UsuarioResponse }) {
  const eliminarUsuario = useEliminarUsuario(usuario.id);
  return (
    <EliminarConDependenciasButton
      entidadLabel={`usuario "${usuario.nombreCompleto}"`}
      useDependencias={useDependenciasUsuario}
      id={usuario.id}
      eliminarPending={eliminarUsuario.isPending}
      onConfirmar={(cascada) => eliminarUsuario.mutate(cascada)}
    />
  );
}

export function UsuariosListPage() {
  const { puede } = usePermiso();
  const usuarioActual = useAuthStore((s) => s.usuario);

  const [page, setPage] = useState(0);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading } = useUsuarios({ page, size: 10 });
  const cambiarEstado = useCambiarEstadoUsuario(usuarioSeleccionado?.id ?? 0);

  const abrirConfirm = useCallback((usuario: UsuarioResponse) => {
    setUsuarioSeleccionado(usuario);
    setConfirmOpen(true);
  }, []);

  // Las columnas se memorizan porque @tanstack/react-table usa la funcion
  // `cell` de cada columna como el "tipo" del componente al renderizar
  // (via flexRender). Si `columns` se recrea en cada render (p. ej. cuando
  // useUsuarios() refresca la lista tras una mutacion), React ve una funcion
  // distinta y desmonta/remonta las celdas, perdiendo el estado local de
  // cualquier dialogo abierto dentro de ellas (como el de restablecer
  // contrasena, que necesita permanecer abierto mostrando la clave temporal).
  const columns: ColumnDef<UsuarioResponse, any>[] = useMemo(() => [
    { accessorKey: "username", header: "Usuario" },
    { accessorKey: "nombreCompleto", header: "Nombre completo" },
    { accessorKey: "rolNombre", header: "Rol" },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <StatusBadge label={row.original.activo ? "Activo" : "Inactivo"} tone={activoTone(row.original.activo)} />
      ),
    },
    {
      accessorKey: "ultimoLogin",
      header: "Ultimo acceso",
      cell: ({ row }) => (row.original.ultimoLogin ? formatDateTime(row.original.ultimoLogin) : "Nunca"),
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => {
        const usuario = row.original;
        const esUsuarioActual = usuario.id === usuarioActual?.id;
        return (
          <div className="flex items-center justify-end gap-2">
            {puede(PERMISOS.USUARIO_EDITAR) && <EditarUsuarioDialog usuario={usuario} />}
            {puede(PERMISOS.USUARIO_EDITAR) && (
              <RestablecerPasswordDialog usuario={usuario} disabled={esUsuarioActual} />
            )}
            {puede(PERMISOS.USUARIO_ELIMINAR) && (
              <Button
                variant="outline"
                className={usuario.activo ? "text-destructive hover:text-destructive" : undefined}
                disabled={esUsuarioActual}
                title={esUsuarioActual ? "No puedes cambiar el estado de tu propio usuario" : undefined}
                onClick={() => abrirConfirm(usuario)}
              >
                {usuario.activo ? "Desactivar" : "Activar"}
              </Button>
            )}
            {puede(PERMISOS.USUARIO_ELIMINAR) && !esUsuarioActual && <EliminarUsuarioAction usuario={usuario} />}
          </div>
        );
      },
    },
  ], [usuarioActual, puede, abrirConfirm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios del sistema y sus roles asignados."
        actions={puede(PERMISOS.USUARIO_CREAR) && <CrearUsuarioDialog />}
      />

      <DataTable
        columns={columns}
        data={data?.contenido ?? []}
        isLoading={isLoading}
        page={data}
        onPageChange={setPage}
        emptyTitle="Sin usuarios"
        emptyDescription="No se encontraron usuarios registrados."
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={usuarioSeleccionado?.activo ? "Desactivar usuario" : "Activar usuario"}
        description={
          usuarioSeleccionado?.activo
            ? `Esta seguro de desactivar a "${usuarioSeleccionado?.nombreCompleto}"?`
            : `Esta seguro de activar a "${usuarioSeleccionado?.nombreCompleto}"?`
        }
        confirmLabel={usuarioSeleccionado?.activo ? "Desactivar" : "Activar"}
        destructive={usuarioSeleccionado?.activo}
        loading={cambiarEstado.isPending}
        onConfirm={() =>
          usuarioSeleccionado &&
          cambiarEstado.mutate(
            { activo: !usuarioSeleccionado.activo },
            { onSuccess: () => setConfirmOpen(false) },
          )
        }
      />
    </div>
  );
}
