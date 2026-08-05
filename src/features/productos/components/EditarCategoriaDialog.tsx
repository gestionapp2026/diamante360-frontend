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
import { Textarea } from "@/components/ui/textarea";
import { useActualizarCategoria } from "@/features/productos/hooks/use-categorias";
import {
  actualizarCategoriaSchema,
  type ActualizarCategoriaFormValues,
} from "@/features/productos/schemas/categoria-schemas";
import type { CategoriaResponse } from "@/features/productos/types";

interface EditarCategoriaDialogProps {
  categoria: CategoriaResponse;
}

export function EditarCategoriaDialog({ categoria }: EditarCategoriaDialogProps) {
  const [open, setOpen] = useState(false);
  const actualizarCategoria = useActualizarCategoria(categoria.id);

  const form = useForm<ActualizarCategoriaFormValues>({
    resolver: zodResolver(actualizarCategoriaSchema),
    defaultValues: {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion ?? "",
      });
    }
  }, [open, categoria, form]);

  async function onSubmit(values: ActualizarCategoriaFormValues) {
    await actualizarCategoria.mutateAsync({
      nombre: values.nombre,
      descripcion: values.descripcion || null,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar categoria</DialogTitle>
          <DialogDescription>Actualiza los datos de la categoria.</DialogDescription>
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
                    <Input placeholder="Embutidos" {...field} />
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
                    <Textarea placeholder="Descripcion de la categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={actualizarCategoria.isPending}>
                {actualizarCategoria.isPending && <Loader2 className="size-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
