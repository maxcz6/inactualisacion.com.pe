const fs = require('fs');

const pageFile = 'src/app/(frontend)/admin/eventos/page.tsx';
let content = fs.readFileSync(pageFile, 'utf8');

// Imports
content = content.replace(
  'import { listarEventos, crearEvento } from "@/services/evento.service";',
  'import { listarEventos, crearEvento, actualizarEvento } from "@/services/evento.service";'
);

// State vars
const stateVars = `
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
`;
content = content.replace('  const [modalAbierto, setModalAbierto] = useState(false);', '  const [modalAbierto, setModalAbierto] = useState(false);\n' + stateVars);

// Fetch user
const fetchUser = `
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setUsuario(d.user);
        }
      })
      .catch(() => {});
  }, []);
`;
content = content.replace('  useEffect(() => {', fetchUser + '\n  useEffect(() => {');

// Edit function
const editFuncs = `
  const abrirModalEditar = (ev: Evento) => {
    setError("");
    setEventoEditando(ev);
    setCodigoBase(ev.codigo_base);
    setNombre(ev.nombre);
    setDescripcion(ev.descripcion || "");
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      if (eventoEditando) {
        const res = await actualizarEvento(eventoEditando.id, {
          codigo_base: codigoBase.trim().toUpperCase(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        });

        if (!res.success) {
          setError(res.error || "No se pudo actualizar el curso/diplomado.");
          setGuardando(false);
          return;
        }
        setMensaje("Curso/Diplomado actualizado exitosamente.");
      } else {
        const res = await crearEvento({
          codigo_base: codigoBase.trim().toUpperCase(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        });

        if (!res.success) {
          setError(res.error || "No se pudo crear el curso/diplomado.");
          setGuardando(false);
          return;
        }
        setMensaje("Curso/Diplomado creado exitosamente.");
      }

      setEventoEditando(null);
      setCodigoBase("");
      setNombre("");
      setDescripcion("");
      setGuardando(false);
      setModalAbierto(false);
      cargarEventos();
    } catch {
      setError("Error de red.");
      setGuardando(false);
    }
  };
`;
// Replace the old handleCrear
content = content.replace(/  const handleCrear = async [\s\S]*?cargarEventos\(\);\n    } catch \{\n      setError\("Error de red\."\);\n      setGuardando\(false\);\n    }\n  };/, editFuncs);

// Table headers - Add Acciones column
content = content.replace('<th className="py-3.5 px-6">Fecha Registro</th>', '<th className="py-3.5 px-6">Fecha Registro</th>\n                {usuario?.rol === "superadmin" && <th className="py-3.5 px-6 text-right">Acciones</th>}');

// Table rows - Add Edit button
const editBtn = `
                    {usuario?.rol === "superadmin" && (
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => abrirModalEditar(ev)}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Editar Curso / Diplomado"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </td>
                    )}
`;
content = content.replace('                    </td>\n                  </tr>', '                    </td>\n' + editBtn + '                  </tr>');

// Fix form submit handler
content = content.replace('onSubmit={handleCrear}', 'onSubmit={handleGuardar}');

// Fix modal close handler to reset `eventoEditando`
content = content.replace(/onClick=\{\(\) => setModalAbierto\(false\)\}/g, 'onClick={() => { setModalAbierto(false); setEventoEditando(null); }}');

// Update modal title logic
content = content.replace('<h3 className="text-base font-bold text-slate-100">Agregar Curso / Diplomado</h3>', '<h3 className="text-base font-bold text-slate-100">{eventoEditando ? "Editar Curso / Diplomado" : "Agregar Curso / Diplomado"}</h3>');

// Update modal button logic
content = content.replace('<span>Guardar Evento</span>', '<span>{eventoEditando ? "Actualizar" : "Guardar Evento"}</span>'); // Note: it might not say Guardar Evento, let's just make sure.

content = content.replace(/>Crear Evento</g, '>{eventoEditando ? "Actualizar" : "Crear Evento"}<');
content = content.replace(/>Guardar</g, '>{eventoEditando ? "Actualizar" : "Guardar"}<');
content = content.replace(/>Crear Curso \/ Diplomado</g, '>{eventoEditando ? "Actualizar" : "Crear Curso / Diplomado"}<');

// Remove original opening logic to fix duplicate declarations
content = content.replace('  const abrirModalNuevo = () => {\n    setError("");', '  const abrirModalNuevo = () => {\n    setError("");\n    setEventoEditando(null);');

fs.writeFileSync(pageFile, content, 'utf8');
console.log('Patch complete.');
