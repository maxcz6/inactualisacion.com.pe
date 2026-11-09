interface PerfilUsuario {
  id: string;
  email: string;
  nombre?: string | null;
  rol: "admin" | "superadmin";
  activo: boolean;
  created_at: string;
}

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function listarUsuarios() {
  const res = await fetch("/api/usuarios");
  return res.json() as Promise<ApiResponse<PerfilUsuario[]>>;
}

export async function crearUsuario(data: {
  email: string;
  nombre: string;
  password: string;
  rol: "admin" | "superadmin";
}) {
  const res = await fetch("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json() as Promise<ApiResponse<PerfilUsuario>>;
}

export async function actualizarUsuario(
  id: string,
  data: Partial<Pick<PerfilUsuario, "nombre" | "rol" | "activo">>
) {
  const res = await fetch(`/api/usuarios/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json() as Promise<ApiResponse<PerfilUsuario>>;
}
