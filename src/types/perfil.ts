export type Rol = "admin" | "superadmin";

export interface Perfil {
  id: string;
  email: string;
  nombre?: string | null;
  rol: Rol;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface SesionPayload {
  sub: string;
  email: string;
  rol: Rol;
  iat?: number;
  exp?: number;
}
