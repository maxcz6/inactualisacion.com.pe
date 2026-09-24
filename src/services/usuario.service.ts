export async function listarUsuarios() {
  const res = await fetch("/api/usuarios");
  return res.json();
}

export async function crearUsuario(data: any) {
  const res = await fetch("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function actualizarUsuario(id: string, data: any) {
  const res = await fetch(`/api/usuarios/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}
