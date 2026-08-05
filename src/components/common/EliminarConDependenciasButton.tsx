import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { DependenciasResponse } from "@/types/api";

interface EliminarConDependenciasButtonProps {
  /** Ej: `cliente "Juan Perez"`, usado en los titulos/descripciones. */
  entidadLabel: string;
  /** Hook de la feature: useDependenciasXxx(id, { enabled }) */
  useDependencias: (id: number, opciones: { enabled: boolean }) => UseQueryResult<DependenciasResponse>;
  id: number;
  onConfirmar: (cascada: boolean) => void;
  eliminarPending: boolean;
  className?: string;
  label?: string;
}

export function EliminarConDependenciasButton({
  entidadLabel,
  useDependencias,
  id,
  onConfirmar,
  eliminarPending,
  className,
  label = "Borrar",
}: EliminarConDependenciasButtonProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useDependencias(id, { enabled: open });

  // Sin esto, el AlertDialog se queda abierto despues de confirmar: al
  // terminar la mutation (exito o error) el dialogo debe cerrarse solo. Sin
  // cerrarlo, en tablas donde cada fila reutiliza su posicion en el DOM (ver
  // DataTable.getRowId) el mismo dialogo "abierto" reaparece mostrando los
  // datos de la fila que quedo en esa posicion tras eliminar la anterior,
  // dando la apariencia de "otro cartel para borrar el siguiente objeto".
  const eliminarPendienteAnterior = useRef(false);
  useEffect(() => {
    if (eliminarPendienteAnterior.current && !eliminarPending) {
      setOpen(false);
    }
    eliminarPendienteAnterior.current = eliminarPending;
  }, [eliminarPending]);

  const bloqueado = data?.bloqueado ?? false;
  const tieneDependencias = data?.tieneDependencias ?? false;

  let titulo = `Borrar ${entidadLabel}`;
  let descripcion = "Esta accion no se puede deshacer.";
  if (!isLoading && data) {
    if (bloqueado) {
      titulo = "No se puede borrar";
      descripcion = data.mensajeBloqueo ?? "No se puede eliminar: existen dependencias asociadas.";
    } else if (tieneDependencias) {
      titulo = `Borrar ${entidadLabel} y datos asociados`;
      descripcion = "Esta accion no se puede deshacer. Tambien se veran afectados los siguientes registros:";
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={className ?? "text-destructive hover:text-destructive"}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {label}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{titulo}</AlertDialogTitle>
            <AlertDialogDescription>{descripcion}</AlertDialogDescription>
          </AlertDialogHeader>

          {isLoading && (
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Verificando dependencias...
            </div>
          )}

          {!isLoading && data && data.dependencias.length > 0 && (
            <ul className="list-disc space-y-1 py-2 pl-5 text-sm text-muted-foreground">
              {data.dependencias.map((dep) => (
                <li key={dep.tipo}>
                  {dep.cantidad} {dep.etiqueta}
                </li>
              ))}
            </ul>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminarPending}>Cancelar</AlertDialogCancel>
            {!isLoading && data && !bloqueado && (
              <AlertDialogAction
                disabled={eliminarPending}
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={(e) => {
                  e.preventDefault();
                  onConfirmar(tieneDependencias);
                }}
              >
                {tieneDependencias ? "Borrar todo" : "Borrar"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
