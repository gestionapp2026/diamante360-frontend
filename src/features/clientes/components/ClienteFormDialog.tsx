import { useEffect, useState, type ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";

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
import {
  crearClienteSchema,
  telefonosFormValuesToArray,
  type CrearClienteFormValues,
} from "@/features/clientes/schemas/cliente-schemas";
import type { ClienteResponse } from "@/features/clientes/types";
import { TipoDocumentoCliente } from "@/types/enums";

const TIPOS_DOCUMENTO: { value: TipoDocumentoCliente; label: string }[] = [
  { value: TipoDocumentoCliente.CC, label: "Cedula de ciudadania" },
  { value: TipoDocumentoCliente.NIT, label: "NIT" },
  { value: TipoDocumentoCliente.CE, label: "Cedula de extranjeria" },
  { value: TipoDocumentoCliente.PASAPORTE, label: "Pasaporte" },
];

interface ClienteFormDialogProps {
  /** Reemplaza el boton por defecto que abre el dialogo (usado al incrustarlo, p.ej. dentro del formulario de factura). */
  trigger?: ReactNode;
  /** Se invoca con el cliente recien creado, ademas de la invalidacion normal de la lista de clientes. */
  onCreated?: (cliente: ClienteResponse) => void;
}

export function ClienteFormDialog({ trigger, onCreated }: ClienteFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: rutas } = useRutas();
  const crearCliente = useCrearCliente();

  const form = useForm<CrearClienteFormValues>({
    resolver: zodResolver(crearClienteSchema),
    defaultValues: {
      tipoDocumento: TipoDocumentoCliente.CC,
      numeroDocumento: "",
      nombre: "",
      telefonos: [{ valor: "" }],
      email: "",
      direccion: "",
      rutaId: undefined,
    },
  });

  const telefonosArray = useFieldArray({ control: form.control, name: "telefonos" });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  async function onSubmit(values: CrearClienteFormValues) {
    const cliente = await crearCliente.mutateAsync({
      tipoDocumento: values.tipoDocumento,
      numeroDocumento: values.numeroDocumento,
      nombre: values.nombre,
      telefonos: telefonosFormValuesToArray(values.telefonos),
      email: values.email || null,
      direccion: values.direccion || null,
      rutaId: values.rutaId ? Number(values.rutaId) : null,
    });
    setOpen(false);
    onCreated?.(cliente);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" />
            Nuevo cliente
          </Button>
        )}
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
              {form.formState.errors.telefonos?.root?.message && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.telefonos.root.message}</p>
              )}
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
