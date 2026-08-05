// Formas comunes de respuesta de la API (mirror de shared.presentation.* en el backend).

export interface PageResponse<T> {
  contenido: T[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface CampoError {
  campo: string;
  mensaje: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  errores: CampoError[];
}

// Parametros de paginacion/orden que acepta Spring Data Pageable via query params.
export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
}

// Preview de dependencias antes de borrar un recurso (ver
// shared.presentation.DependenciasResponse en el backend).
export interface ConteoDependencia {
  tipo: string;
  etiqueta: string;
  cantidad: number;
}

export interface DependenciasResponse {
  tieneDependencias: boolean;
  bloqueado: boolean;
  mensajeBloqueo: string | null;
  dependencias: ConteoDependencia[];
}
