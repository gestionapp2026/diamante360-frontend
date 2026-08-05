// Tipos espejo de los DTOs del backend (usuario/rol.presentation.dto.*).
// Los tipos principales (UsuarioResponse, CrearUsuarioRequest, ActualizarUsuarioRequest,
// RolResponse) ya estan definidos en `@/types/auth`. Aqui solo se agrega lo que falta.

export interface CambiarEstadoUsuarioRequest {
  activo: boolean;
}

export interface ListarUsuariosParams {
  page?: number;
  size?: number;
  sort?: string;
}
