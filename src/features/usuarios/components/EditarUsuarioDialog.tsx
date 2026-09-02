import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoles } from "@/features/usuarios/hooks/use-roles";
import { useActualizarUsuario } from "@/features/usuarios/hooks/use-usuarios";
import {
  actualizarUsuarioSchema,
  type ActualizarUsuarioFormValues,
} from "@/features/usuarios/schemas/usuario-schemas";
import type { UsuarioResponse } from "@/types/auth";

interface EditarUsuarioDialogProps {
  usuario: UsuarioResponse;
}

export function EditarUsuarioDialog({ usuario }: EditarUsuarioDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: roles } = useRoles();
  const actualizarUsuario = useActualizarUsuario(usuario.id);

  const form = useForm<ActualizarUsuarioFormValues>({
    resolver: zodResolver(actualizarUsuarioSchema),
    defaultValues: {
      username: usuario.username,
      nombreCompleto: usuario.nombreCompleto,
      rolId: String(usuario.rolId),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        username: usuario.username,
        nombreCompleto: usuario.nombreCompleto,
        rolId: String(usuario.rolId),
      });
    }
  }, [open, usuario, form]);

  async function onSubmit(values: ActualizarUsuarioFormValues) {
    await actualizarUsuario.mutateAsync({
      username: values.username,
      nombreCompleto: values.nombreCompleto,
      rolId: Number(values.rolId),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>Actualiza el nombre de usuario, el nombre completo y el rol.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="jhon.perez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nombreCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Jhon Perez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles?.map((rol) => (
                        <SelectItem key={rol.id} value={String(rol.id)}>
                          {rol.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={actualizarUsuario.isPending}>
                {actualizarUsuario.isPending && <Loader2 className="size-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
