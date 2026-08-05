import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";

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
import { useCrearCliente } from "@/features/clientes/hooks/use-clientes";
import { useRutas } from "@/features/clientes/hooks/use-rutas";
import { crearClienteSchema, type CrearClienteFormValues } from "@/features/clientes/schemas/cliente-schemas";
import { TipoDocumentoCliente } from "@/types/enums";

const TIPOS_DOCUMENTO: { value: TipoDocumentoCliente; label: string }[] = [
  { value: TipoDocumentoCliente.CC, label: "Cedula de ciudadania" },
  { value: TipoDocumentoCliente.NIT, label: "NIT" },
  { value: TipoDocumentoCliente.CE, label: "Cedula de extranjeria" },
  { value: TipoDocumentoCliente.PASAPORTE, label: "Pasaporte" },
];

export function ClienteFormDialog() {
  const [open, setOpen] = useState(false);
  const { data: rutas } = useRutas();
  const crearCliente = useCrearCliente();

  const form = useForm<CrearClienteFormValues>({
    resolver: zodResolver(crearClienteSchema),
    defaultValues: {
      tipoDocumento: TipoDocumentoCliente.CC,
      numeroDocumento: "",
      nombre: "",
      telefono: "",
      email: "",
      direccion: "",
      rutaId: undefined,
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  async function onSubmit(values: CrearClienteFormValues) {
    await crearCliente.mutateAsync({
      tipoDocumento: values.tipoDocumento,
      numeroDocumento: values.numeroDocumento,
      nombre: values.nombre,
      telefono: values.telefono || null,
      email: values.email || null,
      direccion: values.direccion || null,
      rutaId: values.rutaId ? Number(values.rutaId) : null,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nuevo cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>Registra un nuevo cliente en el sistema.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipoDocumento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de documento</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_DOCUMENTO.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numeroDocumento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero de documento</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            <FormField
              control={form.control}
              name="rutaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ruta</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sin ruta asignada" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rutas?.map((ruta) => (
                        <SelectItem key={ruta.id} value={String(ruta.id)}>
                          {ruta.nombre}
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
              <Button type="submit" disabled={crearCliente.isPending}>
                {crearCliente.isPending && <Loader2 className="size-4 animate-spin" />}
                Crear cliente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
