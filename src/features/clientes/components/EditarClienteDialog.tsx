import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

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
import {
  actualizarClienteSchema,
  telefonosArrayToFormValues,
  telefonosFormValuesToArray,
  type ActualizarClienteFormValues,
} from "@/features/clientes/schemas/cliente-schemas";
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
      telefonos: telefonosArrayToFormValues(cliente.telefonos),
      email: cliente.email ?? "",
      direccion: cliente.direccion ?? "",
    },
  });

  const telefonosArray = useFieldArray({ control: form.control, name: "telefonos" });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: cliente.nombre,
        telefonos: telefonosArrayToFormValues(cliente.telefonos),
        email: cliente.email ?? "",
        direccion: cliente.direccion ?? "",
      });
    }
  }, [open, cliente, form]);

  async function onSubmit(values: ActualizarClienteFormValues) {
    await actualizarCliente.mutateAsync({
      nombre: values.nombre,
      telefonos: telefonosFormValuesToArray(values.telefonos),
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
            <div className="space-y-2">
              <FormLabel>Telefonos</FormLabel>
              {telefonosArray.fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`telefonos.${index}.valor`}
                    render={({ field: telefonoField }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="3001234567" {...telefonoField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    disabled={telefonosArray.fields.length === 1}
                    onClick={() => telefonosArray.remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={telefonosArray.fields.length >= 5}
                onClick={() => telefonosArray.append({ valor: "" })}
              >
                <Plus className="size-4" />
                Agregar telefono
              </Button>
            </div>
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
