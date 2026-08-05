export interface UsuarioSesionResponse {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: string;
  permisos: string[];
  debeCambiarPassword: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiraEnSegundos: number;
  usuario: UsuarioSesionResponse;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNueva: string;
}

export interface UsuarioResponse {
  id: number;
  username: string;
  nombreCompleto: string;
  rolId: number;
  rolNombre: string;
  activo: boolean;
  debeCambiarPassword: boolean;
  ultimoLogin: string | null;
}

export interface CrearUsuarioRequest {
  username: string;
  password: string;
  nombreCompleto: string;
  rolId: number;
}

export interface ActualizarUsuarioRequest {
  nombreCompleto: string;
  rolId: number;
}

export interface RestablecerPasswordResponse {
  id: number;
  username: string;
  passwordTemporal: string;
}

export interface RolResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  permisos: string[];
}
