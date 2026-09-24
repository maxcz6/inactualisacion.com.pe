const fs = require('fs');

const pageFile = 'src/app/(frontend)/admin/eventos/page.tsx';
let content = fs.readFileSync(pageFile, 'utf8');

const editFuncs = `
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

  return`;

const startIdx = content.indexOf('  const handleCrear');
const endIdx = content.indexOf('  return (', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + editFuncs + content.substring(endIdx + '  return'.length);
    fs.writeFileSync(pageFile, content, 'utf8');
    console.log("Successfully replaced handleCrear with handleGuardar.");
} else {
    console.log("Indexes not found.");
}
