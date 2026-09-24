"use client";

import { useState, useEffect } from "react";
import AdminNavbar from "@/components/layout/AdminNavbar";
import { listarUsuarios, crearUsuario, actualizarUsuario } from "@/services/usuario.service";

interface Perfil {
  id: string;
  email: string;
  nombre: string;
  rol: "admin" | "superadmin";
  activo: boolean;
  created_at: string;
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState<{tipo: "ok"|"error", texto: string} | null>(null);

  // Form
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"admin"|"superadmin">("admin");

  const cargar = () => {
    setLoading(true);
    listarUsuarios().then(d => {
      if (d.success) setUsuarios(d.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleToggleEstado = async (u: Perfil) => {
    const res = await actualizarUsuario(u.id, { activo: !u.activo });
    if (res.success) {
      setMensaje({ tipo: "ok", texto: `Usuario ${res.data.email} ${res.data.activo ? "activado" : "desactivado"}` });
      cargar();
    } else {
      setMensaje({ tipo: "error", texto: res.error || "Error al actualizar" });
    }
  };

  const handleEditarClick = (u: Perfil) => {
    setEditId(u.id);
    setEmail(u.email);
    setNombre(u.nombre || "");
    setRol(u.rol);
    setPassword(""); // Se deja vacío intencionalmente, el API actual no permite cambiar password desde aquí pero mantenemos el campo para crear
    setMostrarForm(true);
  };

  const handleNuevoClick = () => {
    setEditId(null);
    setEmail("");
    setNombre("");
    setRol("admin");
    setPassword("");
    setMostrarForm(!mostrarForm);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      // Modo edición
      const res = await actualizarUsuario(editId, { nombre, rol });
      if (res.success) {
        setMensaje({ tipo: "ok", texto: "Usuario actualizado exitosamente" });
        setMostrarForm(false);
        setEditId(null);
        cargar();
      } else {
        setMensaje({ tipo: "error", texto: res.error || "Error al actualizar" });
      }
    } else {
      // Modo creación
      const res = await crearUsuario({ email, nombre, password, rol });
      if (res.success) {
        setMensaje({ tipo: "ok", texto: "Usuario creado exitosamente" });
        setMostrarForm(false);
        setEmail(""); setNombre(""); setPassword("");
        cargar();
      } else {
        setMensaje({ tipo: "error", texto: res.error || "Error al crear" });
      }
    }
  };

  return (
    <>
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Gestión de Administradores</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Controla quién tiene acceso al sistema</p>
          </div>
          <button 
            onClick={handleNuevoClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all w-full sm:w-auto"
          >
            {mostrarForm && !editId ? "Cancelar" : "+ Nuevo Usuario"}
          </button>
        </div>

        {mensaje && (
          <div className={`mb-5 px-4 py-2.5 rounded-xl text-xs font-medium flex justify-between shadow-sm ${mensaje.tipo === "ok" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300" : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300"}`}>
            <span>{mensaje.texto}</span>
            <button onClick={() => setMensaje(null)} className="font-bold">✕</button>
          </div>
        )}

        {mostrarForm && (
          <form onSubmit={handleGuardar} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{editId ? "Editar Usuario" : "Crear Nuevo Usuario"}</h3>
              <button type="button" onClick={() => setMostrarForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input required={!editId} disabled={!!editId} type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:border-indigo-500 disabled:opacity-50" />
              </div>
              {!editId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                  <input required={!editId} type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:border-indigo-500" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rol</label>
                <select value={rol} onChange={e => setRol(e.target.value as any)} className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:border-indigo-500">
                  <option value="admin">Administrador</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 hover:dark:bg-indigo-500 text-white text-xs font-semibold py-2 px-4 rounded-lg self-start mt-2">
              {editId ? "Guardar Cambios" : "Guardar Usuario"}
            </button>
          </form>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-5">Nombre</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Rol</th>
                  <th className="py-3 px-5">Estado</th>
                  <th className="py-3 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400">Cargando...</td></tr>
                ) : (
                  usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-5 font-medium text-slate-900 dark:text-slate-100">{u.nombre || "Sin nombre"}</td>
                      <td className="py-3 px-5 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-semibold ${u.rol === "superadmin" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" : "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-semibold ${u.activo ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"}`}>
                          {u.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right flex items-center justify-end gap-3">
                        <button onClick={() => handleEditarClick(u)} className="text-sky-600 dark:text-sky-400 hover:underline font-semibold">
                          Editar
                        </button>
                        <button onClick={() => handleToggleEstado(u)} className="text-slate-600 dark:text-slate-400 hover:underline">
                          {u.activo ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
