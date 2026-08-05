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
import { useActualizarCliente } from "@/features/clientes/hooks/use-clientes";
import { actualizarClienteSchema, type ActualizarClienteFormValues } from "@/features/clientes/schemas/cliente-schemas";
import type { ClienteResponse } from "@/features/clientes/types";

interface EditarClienteDialogProps {
  cliente: ClienteResponse;
}

export function EditarClienteDialog({ cliente }: EditarClienteDialogProps) {
  const [open, setOpen] = useState(false);
  const actualizarCliente = useActualizarCliente(cliente.id);

  const form = useForm<ActualizarClienteFormValues>({
    resolver: zodResolver(actualizarClienteSchema),
    defaultValues: {
      nombre: cliente.nombre,
      telefono: cliente.telefono ?? "",
      email: cliente.email ?? "",
      direccion: cliente.direccion ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: cliente.nombre,
        telefono: cliente.telefono ?? "",
        email: cliente.email ?? "",
        direccion: cliente.direccion ?? "",
      });
    }
  }, [open, cliente, form]);

  async function onSubmit(values: ActualizarClienteFormValues) {
    await actualizarCliente.mutateAsync({
      nombre: values.nombre,
      telefono: values.telefono || null,
      email: values.email || null,
      direccion: values.direccion || null,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>Actualiza los datos de contacto del cliente.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo o razon social" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl>
                      <Input placeholder="3001234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="cliente@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direccion</FormLabel>
                  <FormControl>
                    <Input placeholder="Direccion de entrega" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={actualizarCliente.isPending}>
                {actualizarCliente.isPending && <Loader2 className="size-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
