const fs = require('fs');
let content = fs.readFileSync('src/app/(frontend)/admin/eventos/page.tsx', 'utf8');

const func = `  const abrirModalNuevo = () => {
    setError('');
    setNombre('');
    setDescripcion('');
    let nextCode = 'CURSO-001';
    if (eventos.length > 0) {
      let maxNum = 0;
      let prefix = 'CURSO-';
      eventos.forEach(ev => {
        const match = ev.codigo_base.match(/^(.*?)-?(\\d+)$/);
        if (match) {
          const num = parseInt(match[2], 10);
          if (num > maxNum) {
            maxNum = num;
            prefix = match[1].endsWith('-') ? match[1] : match[1] + '-';
          }
        }
      });
      if (maxNum > 0) {
        nextCode = \`\${prefix}\${String(maxNum + 1).padStart(3, '0')}\`;
      } else {
        nextCode = \`\${eventos[0].codigo_base}-001\`;
      }
    }
    setCodigoBase(nextCode);
    setModalAbierto(true);
  };

  const handleCrear`;

content = content.replace('  const handleCrear', func);
content = content.replace('onClick={() => setModalAbierto(true)}', 'onClick={abrirModalNuevo}');

fs.writeFileSync('src/app/(frontend)/admin/eventos/page.tsx', content, 'utf8');

let navContent = fs.readFileSync('src/components/layout/AdminNavbar.tsx', 'utf8');
navContent = navContent.replace(/label: "Eventos"/g, 'label: "Cursos / Diplomados"');
fs.writeFileSync('src/components/layout/AdminNavbar.tsx', navContent, 'utf8');

console.log('Update successful');
