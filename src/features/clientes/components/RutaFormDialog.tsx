import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { useActualizarRuta, useCrearRuta } from "@/features/clientes/hooks/use-rutas";
import { rutaSchema, type RutaFormValues } from "@/features/clientes/schemas/ruta-schemas";
import type { RutaResponse } from "@/features/clientes/types";

interface RutaFormDialogProps {
  ruta?: RutaResponse;
}

export function RutaFormDialog({ ruta }: RutaFormDialogProps) {
  const [open, setOpen] = useState(false);
  const esEdicion = !!ruta;
  const crearRuta = useCrearRuta();
  const actualizarRuta = useActualizarRuta(ruta?.id ?? 0);

  const form = useForm<RutaFormValues>({
    resolver: zodResolver(rutaSchema),
    defaultValues: {
      nombre: ruta?.nombre ?? "",
      descripcion: ruta?.descripcion ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: ruta?.nombre ?? "",
        descripcion: ruta?.descripcion ?? "",
      });
    }
  }, [open, ruta, form]);

  async function onSubmit(values: RutaFormValues) {
    const payload = { nombre: values.nombre, descripcion: values.descripcion || null };
    if (esEdicion) {
      await actualizarRuta.mutateAsync(payload);
    } else {
      await crearRuta.mutateAsync(payload);
    }
    setOpen(false);
  }

  const isPending = crearRuta.isPending || actualizarRuta.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {esEdicion ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-4" />
            Editar
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Nueva ruta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar ruta" : "Nueva ruta"}</DialogTitle>
          <DialogDescription>
            {esEdicion ? "Actualiza los datos de la ruta de reparto." : "Crea una nueva ruta de reparto."}
          </DialogDescription>
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
                    <Input placeholder="Ruta norte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripcion de la ruta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {esEdicion ? "Guardar cambios" : "Crear ruta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
