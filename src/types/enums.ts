// Enums espejo de los enums de dominio del backend (Java).
// Los valores son exactamente los nombres serializados por Jackson (el name() del enum).

export const TipoDocumentoCliente = {
  CC: "CC",
  NIT: "NIT",
  CE: "CE",
  PASAPORTE: "PASAPORTE",
} as const;
export type TipoDocumentoCliente = (typeof TipoDocumentoCliente)[keyof typeof TipoDocumentoCliente];

export const TipoEventoCliente = {
  CREACION: "CREACION",
  EDICION: "EDICION",
  CAMBIO_RUTA: "CAMBIO_RUTA",
  ACTIVACION: "ACTIVACION",
  DESACTIVACION: "DESACTIVACION",
} as const;
export type TipoEventoCliente = (typeof TipoEventoCliente)[keyof typeof TipoEventoCliente];

export const TipoVenta = {
  UNIDAD: "UNIDAD",
  PESO_VARIABLE: "PESO_VARIABLE",
} as const;
export type TipoVenta = (typeof TipoVenta)[keyof typeof TipoVenta];

export const UnidadMedida = {
  UND: "UND",
  KG: "KG",
  LB: "LB",
} as const;
export type UnidadMedida = (typeof UnidadMedida)[keyof typeof UnidadMedida];

export const TipoMovimiento = {
  ENTRADA: "ENTRADA",
  SALIDA: "SALIDA",
  AJUSTE: "AJUSTE",
} as const;
export type TipoMovimiento = (typeof TipoMovimiento)[keyof typeof TipoMovimiento];

export const UnidadMedidaInsumo = {
  UND: "UND",
  KG: "KG",
  GR: "GR",
  LT: "LT",
  ML: "ML",
} as const;
export type UnidadMedidaInsumo = (typeof UnidadMedidaInsumo)[keyof typeof UnidadMedidaInsumo];

export const TipoMovimientoInsumo = {
  ENTRADA: "ENTRADA",
  SALIDA: "SALIDA",
} as const;
export type TipoMovimientoInsumo = (typeof TipoMovimientoInsumo)[keyof typeof TipoMovimientoInsumo];

export const TipoPago = {
  CONTADO: "CONTADO",
  CREDITO: "CREDITO",
} as const;
export type TipoPago = (typeof TipoPago)[keyof typeof TipoPago];

export const MedioPago = {
  EFECTIVO: "EFECTIVO",
  NEQUI: "NEQUI",
  LLAVE: "LLAVE",
  DAVIPLATA: "DAVIPLATA",
  BANCOLOMBIA: "BANCOLOMBIA",
} as const;
export type MedioPago = (typeof MedioPago)[keyof typeof MedioPago];

export const EstadoFactura = {
  EMITIDA: "EMITIDA",
  ANULADA: "ANULADA",
} as const;
export type EstadoFactura = (typeof EstadoFactura)[keyof typeof EstadoFactura];

export const TipoEventoFactura = {
  CREACION: "CREACION",
  ANULACION: "ANULACION",
} as const;
export type TipoEventoFactura = (typeof TipoEventoFactura)[keyof typeof TipoEventoFactura];

export const EstadoOrden = {
  PENDIENTE: "PENDIENTE",
  DESPACHADA: "DESPACHADA",
  ANULADA: "ANULADA",
} as const;
export type EstadoOrden = (typeof EstadoOrden)[keyof typeof EstadoOrden];

export const EstadoCuentaPorCobrar = {
  PENDIENTE: "PENDIENTE",
  PARCIAL: "PARCIAL",
  PAGADA: "PAGADA",
  ANULADA: "ANULADA",
} as const;
export type EstadoCuentaPorCobrar = (typeof EstadoCuentaPorCobrar)[keyof typeof EstadoCuentaPorCobrar];

export const TipoEventoCuentaPorCobrar = {
  CREACION: "CREACION",
  ABONO: "ABONO",
  PAGO_TOTAL: "PAGO_TOTAL",
  ANULACION: "ANULACION",
} as const;
export type TipoEventoCuentaPorCobrar = (typeof TipoEventoCuentaPorCobrar)[keyof typeof TipoEventoCuentaPorCobrar];

// Catalogo de permisos (codigos exactos sembrados en V1/V2/V3 de Flyway).
// Se usa solo como referencia de autocompletado; la fuente de verdad en runtime
// es siempre el arreglo `permisos` que llega en el JWT / UsuarioSesionResponse.
export const PERMISOS = {
  DASHBOARD_LEER: "DASHBOARD_LEER",
  PRODUCTO_LEER: "PRODUCTO_LEER",
  PRODUCTO_CREAR: "PRODUCTO_CREAR",
  PRODUCTO_EDITAR: "PRODUCTO_EDITAR",
  PRODUCTO_ELIMINAR: "PRODUCTO_ELIMINAR",
  INSUMO_LEER: "INSUMO_LEER",
  INSUMO_CREAR: "INSUMO_CREAR",
  INSUMO_ELIMINAR: "INSUMO_ELIMINAR",
  INSUMO_AJUSTAR: "INSUMO_AJUSTAR",
  INSUMO_VER_NOMBRE: "INSUMO_VER_NOMBRE",
  FORMULA_LEER: "FORMULA_LEER",
  FORMULA_CREAR: "FORMULA_CREAR",
  FORMULA_EDITAR: "FORMULA_EDITAR",
  FORMULA_PRODUCIR: "FORMULA_PRODUCIR",
  FORMULA_ELIMINAR: "FORMULA_ELIMINAR",
  CLIENTE_LEER: "CLIENTE_LEER",
  CLIENTE_CREAR: "CLIENTE_CREAR",
  CLIENTE_EDITAR: "CLIENTE_EDITAR",
  CLIENTE_ELIMINAR: "CLIENTE_ELIMINAR",
  CLIENTE_VER_DOCUMENTO: "CLIENTE_VER_DOCUMENTO",
  FACTURA_LEER: "FACTURA_LEER",
  FACTURA_CREAR: "FACTURA_CREAR",
  FACTURA_ANULAR: "FACTURA_ANULAR",
  FACTURA_ELIMINAR: "FACTURA_ELIMINAR",
  ORDEN_LEER: "ORDEN_LEER",
  ORDEN_CREAR: "ORDEN_CREAR",
  ORDEN_DESPACHAR: "ORDEN_DESPACHAR",
  ORDEN_ANULAR: "ORDEN_ANULAR",
  ORDEN_ELIMINAR: "ORDEN_ELIMINAR",
  INVENTARIO_LEER: "INVENTARIO_LEER",
  INVENTARIO_AJUSTAR: "INVENTARIO_AJUSTAR",
  DEUDOR_LEER: "DEUDOR_LEER",
  DEUDOR_ABONAR: "DEUDOR_ABONAR",
  REPORTE_LEER: "REPORTE_LEER",
  USUARIO_LEER: "USUARIO_LEER",
  USUARIO_CREAR: "USUARIO_CREAR",
  USUARIO_EDITAR: "USUARIO_EDITAR",
  USUARIO_ELIMINAR: "USUARIO_ELIMINAR",
  ROL_GESTIONAR: "ROL_GESTIONAR",
  CONFIGURACION_LEER: "CONFIGURACION_LEER",
  CONFIGURACION_EDITAR: "CONFIGURACION_EDITAR",
} as const;
export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS];
