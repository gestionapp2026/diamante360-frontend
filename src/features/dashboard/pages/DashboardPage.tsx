import { useNavigate } from "react-router-dom";
import { addDays, format } from "date-fns";
import { AlertTriangle, FlaskConical, HandCoins, PackageX, Receipt, Truck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useProductosStockBajo } from "@/features/productos/hooks/use-productos";
import { useLotesPorVencer } from "@/features/insumos/hooks/use-insumos";
import { useFacturas } from "@/features/facturas/hooks/use-facturas";
import { useDeudores } from "@/features/deudores/hooks/use-deudores";
import { useOrdenes } from "@/features/ordenes/hooks/use-ordenes";
import { usePermiso } from "@/hooks/use-permiso";
import { formatCurrency, formatDate } from "@/lib/format";
import { PERMISOS } from "@/types/enums";

function fechaManana(): string {
  return format(addDays(new Date(), 1), "yyyy-MM-dd");
}

// ---------------------------------------------------------------------------
// StatCards (cada uno gatea su propio fetch por permiso)
// ---------------------------------------------------------------------------

function ProductosStockBajoCard() {
  const { data, isLoading } = useProductosStockBajo();
  const cantidad = data?.length ?? 0;

  return (
    <StatCard
      label="Productos con stock bajo"
      value={isLoading ? "..." : String(cantidad)}
      icon={PackageX}
      tone={cantidad > 0 ? "warning" : "default"}
    />
  );
}

function InsumosPorVencerCard() {
  const { data, isLoading } = useLotesPorVencer(30);
  const cantidad = data?.length ?? 0;

  return (
    <StatCard
      label="Insumos por vencer (30 dias)"
      value={isLoading ? "..." : String(cantidad)}
      icon={FlaskConical}
      tone={cantidad > 0 ? "warning" : "default"}
    />
  );
}

function FacturasHoyCard() {
  const { data, isLoading } = useFacturas({ page: 0, size: 1, estado: "EMITIDA", sort: "fecha,desc" });

  return (
    <StatCard
      label="Facturas emitidas"
      value={isLoading ? "..." : String(data?.totalElementos ?? 0)}
      icon={Receipt}
    />
  );
}

function CarteraPendienteCard() {
  const pendientesQuery = useDeudores({ page: 0, size: 100, estado: "PENDIENTE", sort: "fecha,desc" });
  const parcialesQuery = useDeudores({ page: 0, size: 100, estado: "PARCIAL", sort: "fecha,desc" });

  const isLoading = pendientesQuery.isLoading || parcialesQuery.isLoading;
  const total =
    (pendientesQuery.data?.contenido ?? []).reduce((acc, c) => acc + c.saldoPendiente, 0) +
    (parcialesQuery.data?.contenido ?? []).reduce((acc, c) => acc + c.saldoPendiente, 0);

  return (
    <StatCard
      label="Cartera pendiente"
      value={isLoading ? "..." : formatCurrency(total)}
      icon={HandCoins}
      tone={!isLoading && total > 0 ? "destructive" : "default"}
    />
  );
}

function EntregasMananaCard() {
  const fecha = fechaManana();
  const { data, isLoading } = useOrdenes({
    fechaEntregaDesde: fecha,
    fechaEntregaHasta: fecha,
    estado: "PENDIENTE",
    page: 0,
    size: 1,
  });
  const cantidad = data?.totalElementos ?? 0;

  return (
    <StatCard
      label="Entregas para manana"
      value={isLoading ? "..." : String(cantidad)}
      icon={Truck}
      tone={cantidad > 0 ? "warning" : "default"}
    />
  );
}

// ---------------------------------------------------------------------------
// Secciones detalladas
// ---------------------------------------------------------------------------

function ProductosStockBajoSection() {
  const { data, isLoading } = useProductosStockBajo();
  const productos = (data ?? []).slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 text-warning" />
          Productos con stock bajo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : productos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay productos con stock bajo</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Stock actual / minimo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">{producto.nombre}</TableCell>
                  <TableCell>{producto.categoriaNombre}</TableCell>
                  <TableCell className="text-right">
                    {producto.stockActual} / {producto.stockMinimo}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function EstadoFacturaTone(estado: string) {
  return estado === "ANULADA" ? "destructive" : "success";
}

function UltimasFacturasSection() {
  const navigate = useNavigate();
  const { puede } = usePermiso();
  const { data, isLoading } = useFacturas({ page: 0, size: 5, sort: "fecha,desc" });
  const facturas = data?.contenido ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="size-4 text-primary" />
          Ultimas facturas
        </CardTitle>
        {puede(PERMISOS.FACTURA_LEER) && (
          <Button variant="outline" size="sm" onClick={() => navigate("/facturas")}>
            Ver todas
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : facturas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay facturas registradas</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturas.map((factura) => (
                <TableRow key={factura.id}>
                  <TableCell className="font-medium">{factura.numero}</TableCell>
                  <TableCell>{factura.clienteNombre}</TableCell>
                  <TableCell className="text-right">{formatCurrency(factura.total)}</TableCell>
                  <TableCell>
                    <StatusBadge label={factura.estado} tone={EstadoFacturaTone(factura.estado)} />
                  </TableCell>
                  <TableCell>{formatDate(factura.fecha)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function EntregasMananaSection() {
  const navigate = useNavigate();
  const { puede } = usePermiso();
  const fecha = fechaManana();
  const { data, isLoading } = useOrdenes({
    fechaEntregaDesde: fecha,
    fechaEntregaHasta: fecha,
    estado: "PENDIENTE",
    page: 0,
    size: 20,
  });
  const ordenes = data?.contenido ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="size-4 text-primary" />
          Entregas para manana
        </CardTitle>
        {puede(PERMISOS.ORDEN_LEER) && (
          <Button variant="outline" size="sm" onClick={() => navigate("/ordenes")}>
            Ver todas
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : ordenes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay entregas programadas para manana</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordenes.map((orden) => (
                <TableRow key={orden.id}>
                  <TableCell className="font-medium">{orden.numero}</TableCell>
                  <TableCell>{orden.clienteNombre}</TableCell>
                  <TableCell>
                    {orden.detalles.length} producto{orden.detalles.length === 1 ? "" : "s"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function FacturasPorTipoPagoChart() {
  const { data, isLoading } = useFacturas({ page: 0, size: 100, sort: "fecha,desc" });
  const facturas = data?.contenido ?? [];

  const conteo = facturas.reduce(
    (acc, factura) => {
      if (factura.tipoPago === "CONTADO") acc.contado += 1;
      else if (factura.tipoPago === "CREDITO") acc.credito += 1;
      return acc;
    },
    { contado: 0, credito: 0 },
  );

  const chartData = [
    { tipoPago: "Contado", cantidad: conteo.contado },
    { tipoPago: "Credito", cantidad: conteo.credito },
  ];

  const sinDatos = !isLoading && conteo.contado === 0 && conteo.credito === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Facturas por tipo de pago</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : sinDatos ? (
          <p className="text-sm text-muted-foreground">Sin datos suficientes</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipoPago" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="var(--color-primary, #2563eb)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Pagina principal
// ---------------------------------------------------------------------------

export function DashboardPage() {
  const { puede } = usePermiso();

  return (
    <div className="space-y-6">
      <PageHeader title="Panel principal" description="Resumen general de la operacion de El Diamante 360." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {puede(PERMISOS.PRODUCTO_LEER) && <ProductosStockBajoCard />}
        {puede(PERMISOS.INSUMO_LEER) && <InsumosPorVencerCard />}
        {puede(PERMISOS.FACTURA_LEER) && <FacturasHoyCard />}
        {puede(PERMISOS.DEUDOR_LEER) && <CarteraPendienteCard />}
        {puede(PERMISOS.ORDEN_LEER) && <EntregasMananaCard />}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {puede(PERMISOS.PRODUCTO_LEER) && <ProductosStockBajoSection />}
        {puede(PERMISOS.FACTURA_LEER) && <UltimasFacturasSection />}
        {puede(PERMISOS.ORDEN_LEER) && <EntregasMananaSection />}
      </div>

      {puede(PERMISOS.FACTURA_LEER) && <FacturasPorTipoPagoChart />}
    </div>
  );
}
