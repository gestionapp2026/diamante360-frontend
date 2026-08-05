import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable } from "@/components/common/DataTable";
import { EliminarConDependenciasButton } from "@/components/common/EliminarConDependenciasButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, activoTone } from "@/components/common/StatusBadge";
import { EditarClienteDialog } from "@/features/clientes/components/EditarClienteDialog";
import { EstablecerPrecioClienteDialog } from "@/features/clientes/components/EstablecerPrecioClienteDialog";
import {
  useAsignarRutaCliente,
  useCambiarEstadoCliente,
  useCliente,
  useDependenciasCliente,
  useEliminarCliente,
  useEliminarPrecioCliente,
  useHistorialCliente,
  useObservacionesCliente,
  usePreciosCliente,
  useRegistrarObservacion,
} from "@/features/clientes/hooks/use-clientes";
import { useRutas } from "@/features/clientes/hooks/use-rutas";
import {
  registrarObservacionSchema,
  type RegistrarObservacionFormValues,
} from "@/features/clientes/schemas/cliente-schemas";
import type {
  HistorialClienteResponse,
  ObservacionClienteResponse,
  PrecioClienteProductoResponse,
} from "@/features/clientes/types";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { PERMISOS, TipoEventoCliente, type TipoDocumentoCliente } from "@/types/enums";

const TIPO_DOCUMENTO_LABEL: Record<TipoDocumentoCliente, string> = {
  CC: "Cedula de ciudadania",
  NIT: "NIT",
  CE: "Cedula de extranjeria",
  PASAPORTE: "Pasaporte",
};

const TIPO_EVENTO_LABEL: Record<TipoEventoCliente, string> = {
  CREACION: "Creacion",
  EDICION: "Edicion",
  CAMBIO_RUTA: "Cambio de ruta",
  ACTIVACION: "Activacion",
  DESACTIVACION: "Desactivacion",
};

const TIPO_EVENTO_TONE: Record<TipoEventoCliente, "success" | "warning" | "destructive" | "muted" | "primary"> = {
  CREACION: "primary",
  EDICION: "muted",
  CAMBIO_RUTA: "warning",
  ACTIVACION: "success",
  DESACTIVACION: "destructive",
};

function DatosTab({ clienteId }: { clienteId: number }) {
  const navigate = useNavigate();
  const { data: cliente } = useCliente(clienteId);
  const { data: rutas } = useRutas();
  const { puede } = usePermiso();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cambiarEstado = useCambiarEstadoCliente(clienteId);
  const asignarRuta = useAsignarRutaCliente(clienteId);
  const eliminarCliente = useEliminarCliente(clienteId);

  if (!cliente) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Datos del cliente</CardTitle>
          <div className="flex items-center gap-2">
            {puede(PERMISOS.CLIENTE_EDITAR) && <EditarClienteDialog cliente={cliente} />}
            {puede(PERMISOS.CLIENTE_ELIMINAR) && (
              <Button
                variant="outline"
                className={cliente.activo ? "text-destructive hover:text-destructive" : undefined}
                onClick={() => setConfirmOpen(true)}
              >
                {cliente.activo ? "Desactivar" : "Activar"}
              </Button>
            )}
            {puede(PERMISOS.CLIENTE_ELIMINAR) && (
              <EliminarConDependenciasButton
                entidadLabel={`cliente "${cliente.nombre}"`}
                useDependencias={useDependenciasCliente}
                id={clienteId}
                eliminarPending={eliminarCliente.isPending}
                onConfirmar={(cascada) => eliminarCliente.mutate(cascada, { onSuccess: () => navigate("/clientes") })}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Tipo y numero de documento</p>
            <p className="text-sm font-medium">
              {TIPO_DOCUMENTO_LABEL[cliente.tipoDocumento]} ·{" "}
              {puede(PERMISOS.CLIENTE_VER_DOCUMENTO) ? (cliente.numeroDocumento ?? "-") : "(oculto)"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nombre</p>
            <p className="text-sm font-medium">{cliente.nombre}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Telefono</p>
            <p className="text-sm font-medium">{cliente.telefono ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{cliente.email ?? "-"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Direccion</p>
            <p className="text-sm font-medium">{cliente.direccion ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <StatusBadge label={cliente.activo ? "Activo" : "Inactivo"} tone={activoTone(cliente.activo)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ruta asignada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-sm items-center gap-3">
            <Select
              value={cliente.rutaId ? String(cliente.rutaId) : "sin-ruta"}
              onValueChange={(value) =>
                asignarRuta.mutate({ rutaId: value === "sin-ruta" ? null : Number(value) })
              }
              disabled={!puede(PERMISOS.CLIENTE_EDITAR) || asignarRuta.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sin ruta asignada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sin-ruta">Sin ruta asignada</SelectItem>
                {rutas?.map((ruta) => (
                  <SelectItem key={ruta.id} value={String(ruta.id)}>
                    {ruta.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {asignarRuta.isPending && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={cliente.activo ? "Desactivar cliente" : "Activar cliente"}
        description={
          cliente.activo
            ? `Esta seguro de desactivar a "${cliente.nombre}"?`
            : `Esta seguro de activar a "${cliente.nombre}"?`
        }
        confirmLabel={cliente.activo ? "Desactivar" : "Activar"}
        destructive={cliente.activo}
        loading={cambiarEstado.isPending}
        onConfirm={() =>
          cambiarEstado.mutate({ activo: !cliente.activo }, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </div>
  );
}

function ObservacionesTab({ clienteId }: { clienteId: number }) {
  const { puede } = usePermiso();
  const [page, setPage] = useState(0);
  const { data, isLoading } = useObservacionesCliente(clienteId, { page, size: 10 });
  const registrarObservacion = useRegistrarObservacion(clienteId);

  const form = useForm<RegistrarObservacionFormValues>({
    resolver: zodResolver(registrarObservacionSchema),
    defaultValues: { texto: "" },
  });

  async function onSubmit(values: RegistrarObservacionFormValues) {
    await registrarObservacion.mutateAsync(values);
    form.reset();
  }

  const columns: ColumnDef<ObservacionClienteResponse, any>[] = [
    { accessorKey: "texto", header: "Observacion" },
    { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => formatDateTime(row.original.fecha) },
  ];

  return (
    <div className="space-y-6">
      {puede(PERMISOS.CLIENTE_CREAR) && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar observacion</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <FormField
                  control={form.control}
                  name="texto"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea placeholder="Escribe una observacion sobre el cliente..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={registrarObservacion.isPending}>
                  {registrarObservacion.isPending && <Loader2 className="size-4 animate-spin" />}
                  Registrar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={data?.contenido ?? []}
        isLoading={isLoading}
        page={data}
        onPageChange={setPage}
        emptyTitle="Sin observaciones"
        emptyDescription="Todavia no se han registrado observaciones para este cliente."
      />
    </div>
  );
}

function HistorialTab({ clienteId }: { clienteId: number }) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useHistorialCliente(clienteId, { page, size: 10 });

  const columns: ColumnDef<HistorialClienteResponse, any>[] = [
    {
      accessorKey: "tipoEvento",
      header: "Evento",
      cell: ({ row }) => (
        <StatusBadge label={TIPO_EVENTO_LABEL[row.original.tipoEvento]} tone={TIPO_EVENTO_TONE[row.original.tipoEvento]} />
      ),
    },
    { accessorKey: "descripcion", header: "Descripcion", cell: ({ row }) => row.original.descripcion ?? "-" },
    { accessorKey: "fecha", header: "Fecha", cell: ({ row }) => formatDateTime(row.original.fecha) },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.contenido ?? []}
      isLoading={isLoading}
      page={data}
      onPageChange={setPage}
      emptyTitle="Sin historial"
      emptyDescription="Todavia no hay eventos registrados para este cliente."
    />
  );
}

function PrecioAccionesCell({ clienteId, precio }: { clienteId: number; precio: PrecioClienteProductoResponse }) {
  const { puede } = usePermiso();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const eliminarPrecio = useEliminarPrecioCliente(clienteId);

  if (!puede(PERMISOS.CLIENTE_EDITAR)) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setConfirmOpen(true)}
      >
        Eliminar
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar precio especial"
        description={`Esta seguro de eliminar el precio especial para "${precio.productoNombre ?? "este producto"}"? El cliente volvera a facturarse con el precio de venta estandar.`}
        confirmLabel="Eliminar"
        destructive
        loading={eliminarPrecio.isPending}
        onConfirm={() =>
          eliminarPrecio.mutate(precio.id, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </div>
  );
}

function PreciosTab({ clienteId }: { clienteId: number }) {
  const { puede } = usePermiso();
  const [page, setPage] = useState(0);
  const { data, isLoading } = usePreciosCliente(clienteId, { page, size: 10 });

  const columns: ColumnDef<PrecioClienteProductoResponse, any>[] = [
    { accessorKey: "productoNombre", header: "Producto", cell: ({ row }) => row.original.productoNombre ?? "-" },
    { accessorKey: "precio", header: "Precio", cell: ({ row }) => formatCurrency(row.original.precio) },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => <PrecioAccionesCell clienteId={clienteId} precio={row.original} />,
    },
  ];

  return (
    <div className="space-y-6">
      {puede(PERMISOS.CLIENTE_EDITAR) && (
        <div className="flex justify-end">
          <EstablecerPrecioClienteDialog clienteId={clienteId} />
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.contenido ?? []}
        isLoading={isLoading}
        page={data}
        onPageChange={setPage}
        emptyTitle="Sin precios especiales"
        emptyDescription="Este cliente todavia no tiene precios especiales configurados para ningun producto."
      />
    </div>
  );
}

export function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clienteId = Number(id);
  const { data: cliente, isLoading } = useCliente(clienteId);
  const { puede } = usePermiso();

  if (isLoading || !cliente) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const documentoTexto = puede(PERMISOS.CLIENTE_VER_DOCUMENTO) ? (cliente.numeroDocumento ?? "-") : "(oculto)";

  return (
    <div className="space-y-6">
      <PageHeader
        title={cliente.nombre}
        description={`${TIPO_DOCUMENTO_LABEL[cliente.tipoDocumento]} · ${documentoTexto}`}
        actions={
          <Button variant="outline" onClick={() => navigate("/clientes")}>
            <ArrowLeft className="size-4" />
            Volver
          </Button>
        }
      />

      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="observaciones">Observaciones</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="precios">Precios</TabsTrigger>
        </TabsList>
        <TabsContent value="datos" className="mt-4">
          <DatosTab clienteId={clienteId} />
        </TabsContent>
        <TabsContent value="observaciones" className="mt-4">
          <ObservacionesTab clienteId={clienteId} />
        </TabsContent>
        <TabsContent value="historial" className="mt-4">
          <HistorialTab clienteId={clienteId} />
        </TabsContent>
        <TabsContent value="precios" className="mt-4">
          <PreciosTab clienteId={clienteId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
