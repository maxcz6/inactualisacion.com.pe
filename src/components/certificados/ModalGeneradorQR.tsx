"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Participante } from "@/types/participante";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  participante: Participante | null;
}

export default function ModalGeneradorQR({ isOpen, onClose, participante }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [contenido, setContenido] = useState("");
  const [tamano, setTamano] = useState<number>(600); // 600px alta calidad
  const [incluirLogo, setIncluirLogo] = useState(true);
  const [estiloQR, setEstiloQR] = useState<"elegante" | "clasico">("elegante");
  const [modo, setModo] = useState<"url" | "codigo" | "personalizado">("url");

  // Al abrir, generar el contenido inicial según el participante
  useEffect(() => {
    if (!isOpen) return;

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    if (participante) {
      if (modo === "url") {
        setContenido(`${baseUrl}/?dni=${participante.dni}`);
      } else if (modo === "codigo") {
        setContenido(participante.codigo);
      }
    } else {
      setContenido(baseUrl);
    }
  }, [isOpen, participante, modo]);

  // Helper para dibujar rectángulos redondeados con fallback
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }
  };

  const drawFinderPattern = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    cellSize: number,
    darkColor: string,
    lightColor: string
  ) => {
    // 1. Marco exterior 7x7 módulos (oscuro con esquinas redondeadas)
    const outerSize = 7 * cellSize;
    const outerRadius = outerSize * 0.22;
    ctx.fillStyle = darkColor;
    drawRoundedRect(ctx, x, y, outerSize, outerSize, outerRadius);
    ctx.fill();

    // 2. Anillo interior 5x5 módulos (blanco con esquinas redondeadas)
    const midSize = 5 * cellSize;
    const midRadius = midSize * 0.24;
    ctx.fillStyle = lightColor;
    drawRoundedRect(ctx, x + cellSize, y + cellSize, midSize, midSize, midRadius);
    ctx.fill();

    // 3. Punto central 3x3 módulos (oscuro con esquinas redondeadas)
    const innerSize = 3 * cellSize;
    const innerRadius = innerSize * 0.35;
    ctx.fillStyle = darkColor;
    drawRoundedRect(ctx, x + 2 * cellSize, y + 2 * cellSize, innerSize, innerSize, innerRadius);
    ctx.fill();
  };

  // Helper para dibujar rectángulos con esquinas personalizadas
  const drawCustomCornerRect = (ctx: CanvasRenderingContext2D, rx: number, ry: number, size: number, radius: number, sharpCorner: 'TL' | 'TR' | 'BL' | 'BR') => {
    const rTL = sharpCorner === 'TL' ? 0 : radius;
    const rTR = sharpCorner === 'TR' ? 0 : radius;
    const rBR = sharpCorner === 'BR' ? 0 : radius;
    const rBL = sharpCorner === 'BL' ? 0 : radius;
    
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(rx, ry, size, size, [rTL, rTR, rBR, rBL]);
    } else {
      ctx.moveTo(rx + rTL, ry);
      ctx.lineTo(rx + size - rTR, ry);
      ctx.arcTo(rx + size, ry, rx + size, ry + rTR, rTR);
      ctx.lineTo(rx + size, ry + size - rBR);
      ctx.arcTo(rx + size, ry + size, rx + size - rBR, ry + size, rBR);
      ctx.lineTo(rx + rBL, ry + size);
      ctx.arcTo(rx, ry + size, rx, ry + size - rBL, rBL);
      ctx.lineTo(rx, ry + rTL);
      ctx.arcTo(rx, ry, rx + rTL, ry, rTL);
    }
    ctx.fill();
  };

  // Dibujar el QR con estilo personalizado y logo central
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !contenido) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const isClasico = estiloQR === "clasico";
      
      // Generar matriz de módulos con nivel de error 'H' (30% redundancia)
      const qr = QRCode.create(contenido, { errorCorrectionLevel: "H" });
      const numModules = qr.modules.size;
      const marginModules = 3; // Margen de módulos alrededor
      const totalModules = numModules + marginModules * 2;
      const cellSize = tamano / totalModules;
      const offset = marginModules * cellSize;

      // Dimensionar canvas
      canvas.width = tamano;
      canvas.height = tamano;

      const darkColor = isClasico ? "#000000" : "#0f172a"; // Negro puro para clásico, slate-900 para elegante
      const lightColor = "#ffffff";

      // 1. Fondo blanco limpio
      ctx.fillStyle = lightColor;
      ctx.fillRect(0, 0, tamano, tamano);

      // Centro del QR
      const cx = tamano / 2;
      const cy = tamano / 2;

      // Dimensiones del logo central
      const logoHeight = tamano * 0.255;
      const logoWidth = logoHeight * (1126 / 1303); // proporción original del logo DPW
      const clearanceRx = (logoWidth / 2) + 4;
      const clearanceRy = (logoHeight / 2) + 4;

      // 2. Dibujar módulos de datos
      ctx.fillStyle = darkColor;
      for (let r = 0; r < numModules; r++) {
        for (let c = 0; c < numModules; c++) {
          if (r < 7 && c < 7) continue;
          if (r < 7 && c >= numModules - 7) continue;
          if (r >= numModules - 7 && c < 7) continue;

          const mx = offset + c * cellSize;
          const my = offset + r * cellSize;
          const moduleCx = mx + cellSize / 2;
          const moduleCy = my + cellSize / 2;

          if (incluirLogo) {
            const dx = (moduleCx - cx) / clearanceRx;
            const dy = (moduleCy - cy) / clearanceRy;
            if (dx * dx + dy * dy <= 1) {
              continue;
            }
          }

          if (qr.modules.get(r, c)) {
            // Dibujar módulo
            ctx.beginPath();
            if (isClasico) {
              ctx.rect(mx, my, cellSize + 0.35, cellSize + 0.35);
            } else {
              if (typeof ctx.roundRect === "function") {
                ctx.roundRect(mx, my, cellSize + 0.35, cellSize + 0.35, cellSize * 0.25);
              } else {
                ctx.rect(mx, my, cellSize + 0.35, cellSize + 0.35);
              }
            }
            ctx.fill();
          }
        }
      }

      // 3. Dibujar Finder Patterns (Ojos)
      const drawFinderPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number, darkColor: string, lightColor: string, sharpCorner: 'TL' | 'TR' | 'BL' | 'BR') => {
        const outerSize = 7 * cellSize;
        const midSize = 5 * cellSize;
        const innerSize = 3 * cellSize;
        
        if (isClasico) {
          ctx.fillStyle = darkColor;
          ctx.fillRect(x, y, outerSize, outerSize);
          ctx.fillStyle = lightColor;
          ctx.fillRect(x + cellSize, y + cellSize, midSize, midSize);
          ctx.fillStyle = darkColor;
          ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, innerSize, innerSize);
        } else {
          ctx.fillStyle = darkColor;
          drawCustomCornerRect(ctx, x, y, outerSize, outerSize * 0.3, sharpCorner);
          
          ctx.fillStyle = lightColor;
          drawCustomCornerRect(ctx, x + cellSize, y + cellSize, midSize, midSize * 0.24, sharpCorner);
          
          ctx.fillStyle = darkColor;
          drawCustomCornerRect(ctx, x + 2 * cellSize, y + 2 * cellSize, innerSize, innerSize * 0.35, sharpCorner);
        }
      };

      // Superior-Izquierdo
      drawFinderPattern(ctx, offset, offset, cellSize, darkColor, lightColor, 'BR');
      // Superior-Derecho
      drawFinderPattern(ctx, offset + (numModules - 7) * cellSize, offset, cellSize, darkColor, lightColor, 'BL');
      // Inferior-Izquierdo
      drawFinderPattern(ctx, offset, offset + (numModules - 7) * cellSize, cellSize, darkColor, lightColor, 'TR');

      // 4. Dibujar Emblema / Logo Central
      if (incluirLogo) {
        const img = new Image();
        const renderLogo = () => {
          ctx.save();
          ctx.beginPath();
          if (isClasico) {
            ctx.rect(cx - clearanceRx, cy - clearanceRy, clearanceRx * 2, clearanceRy * 2);
          } else {
            ctx.ellipse(cx, cy, clearanceRx, clearanceRy, 0, 0, Math.PI * 2);
          }
          ctx.fillStyle = lightColor;
          ctx.fill();

          const lx = cx - logoWidth / 2;
          const ly = cy - logoHeight / 2;
          ctx.drawImage(img, lx, ly, logoWidth, logoHeight);
          ctx.restore();
        };

        img.onload = renderLogo;
        img.src = "/logo_dpw.png";
        if (img.complete) {
          renderLogo();
        }
      }
    } catch (err) {
      console.error("Error al renderizar QR personalizado:", err);
    }
  }, [isOpen, contenido, tamano, incluirLogo, estiloQR]);

  if (!isOpen) return null;

  const handleDescargar = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    const cod = participante ? participante.codigo : "codigo-qr";
    link.download = `QR-${cod}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleDescargarSVG = () => {
    if (!contenido) return;
    try {
      const isClasico = estiloQR === "clasico";
      
      const qr = QRCode.create(contenido, { errorCorrectionLevel: "H" });
      const numModules = qr.modules.size;
      const marginModules = 3;
      const totalModules = numModules + marginModules * 2;
      const cellSize = tamano / totalModules;
      const offset = marginModules * cellSize;
      const cx = tamano / 2;
      const cy = tamano / 2;
      const logoHeight = tamano * 0.255;
      const logoWidth = logoHeight * (1126 / 1303);
      const clearanceRx = (logoWidth / 2) + 4;
      const clearanceRy = (logoHeight / 2) + 4;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tamano} ${tamano}" width="${tamano}" height="${tamano}">`;
      svg += `<rect width="${tamano}" height="${tamano}" fill="#ffffff"/>`;

      for (let r = 0; r < numModules; r++) {
        for (let c = 0; c < numModules; c++) {
          if (r < 7 && c < 7) continue;
          if (r < 7 && c >= numModules - 7) continue;
          if (r >= numModules - 7 && c < 7) continue;

          const mx = offset + c * cellSize;
          const my = offset + r * cellSize;
          const mcx = mx + cellSize / 2;
          const mcy = my + cellSize / 2;

          if (incluirLogo) {
            const dx = (mcx - cx) / clearanceRx;
            const dy = (mcy - cy) / clearanceRy;
            if (dx * dx + dy * dy <= 1) continue;
          }

          if (qr.modules.get(r, c)) {
            if (isClasico) {
              svg += `<rect x="${mx.toFixed(2)}" y="${my.toFixed(2)}" width="${(cellSize + 0.35).toFixed(2)}" height="${(cellSize + 0.35).toFixed(2)}" fill="#000000"/>`;
            } else {
              svg += `<rect x="${mx.toFixed(2)}" y="${my.toFixed(2)}" width="${(cellSize + 0.35).toFixed(2)}" height="${(cellSize + 0.35).toFixed(2)}" rx="${(cellSize * 0.25).toFixed(2)}" fill="#0f172a"/>`;
            }
          }
        }
      }

      const drawSvgCustomRect = (x: number, y: number, size: number, radius: number, sharpCorner: 'TL' | 'TR' | 'BL' | 'BR', color: string) => {
        const rTL = sharpCorner === 'TL' ? 0 : radius;
        const rTR = sharpCorner === 'TR' ? 0 : radius;
        const rBR = sharpCorner === 'BR' ? 0 : radius;
        const rBL = sharpCorner === 'BL' ? 0 : radius;
        
        let d = `M ${x+rTL} ${y} `;
        d += `L ${x+size-rTR} ${y} `;
        if (rTR > 0) d += `A ${rTR} ${rTR} 0 0 1 ${x+size} ${y+rTR} `;
        d += `L ${x+size} ${y+size-rBR} `;
        if (rBR > 0) d += `A ${rBR} ${rBR} 0 0 1 ${x+size-rBR} ${y+size} `;
        d += `L ${x+rBL} ${y+size} `;
        if (rBL > 0) d += `A ${rBL} ${rBL} 0 0 1 ${x} ${y+size-rBL} `;
        d += `L ${x} ${y+rTL} `;
        if (rTL > 0) d += `A ${rTL} ${rTL} 0 0 1 ${x+rTL} ${y} `;
        d += 'Z';
        return `<path d="${d}" fill="${color}"/>`;
      };

      const drawSvgFinder = (fx: number, fy: number, sharpCorner: 'TL' | 'TR' | 'BL' | 'BR') => {
        const outerSize = 7 * cellSize;
        const midSize = 5 * cellSize;
        const inSize = 3 * cellSize;
        
        if (isClasico) {
          let res = `<rect x="${fx}" y="${fy}" width="${outerSize}" height="${outerSize}" fill="#000000"/>`;
          res += `<rect x="${fx + cellSize}" y="${fy + cellSize}" width="${midSize}" height="${midSize}" fill="#ffffff"/>`;
          res += `<rect x="${fx + 2 * cellSize}" y="${fy + 2 * cellSize}" width="${inSize}" height="${inSize}" fill="#000000"/>`;
          return res;
        } else {
          let res = drawSvgCustomRect(fx, fy, outerSize, outerSize * 0.3, sharpCorner, "#0f172a");
          res += drawSvgCustomRect(fx + cellSize, fy + cellSize, midSize, midSize * 0.24, sharpCorner, "#ffffff");
          res += drawSvgCustomRect(fx + 2 * cellSize, fy + 2 * cellSize, inSize, inSize * 0.35, sharpCorner, "#0f172a");
          return res;
        }
      };

      svg += drawSvgFinder(offset, offset, 'BR');
      svg += drawSvgFinder(offset + (numModules - 7) * cellSize, offset, 'BL');
      svg += drawSvgFinder(offset, offset + (numModules - 7) * cellSize, 'TR');

      if (incluirLogo) {
        if (isClasico) {
          svg += `<rect x="${(cx - clearanceRx).toFixed(2)}" y="${(cy - clearanceRy).toFixed(2)}" width="${(clearanceRx * 2).toFixed(2)}" height="${(clearanceRy * 2).toFixed(2)}" fill="#ffffff"/>`;
        } else {
          svg += `<ellipse cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" rx="${clearanceRx.toFixed(2)}" ry="${clearanceRy.toFixed(2)}" fill="#ffffff"/>`;
        }
        const lx = cx - logoWidth / 2;
        const ly = cy - logoHeight / 2;
        svg += `<image href="/logo_dpw.png" x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" width="${logoWidth.toFixed(2)}" height="${logoHeight.toFixed(2)}"/>`;
      }

      svg += "</svg>";

      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cod = participante ? participante.codigo : "codigo-qr";
      link.download = `QR-${cod}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error al descargar SVG:", e);
    }
  };

  const handleImprimir = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const ventana = window.open("", "_blank");
    if (!ventana) return;
    ventana.document.write(`
      <html>
        <head>
          <title>Imprimir QR - ${participante?.codigo || ""}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0; }
            img { max-width: 380px; height: auto; }
            h2 { margin: 10px 0 4px; font-size: 18px; }
            p { margin: 2px 0; color: #555; font-size: 14px; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" />
          <h2>${participante?.nombre || "Certificado Oficial"}</h2>
          <p>DNI: ${participante?.dni || ""}</p>
          <p>Código: ${participante?.codigo || ""}</p>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-black px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">Generador de Código QR</h3>
            <p className="text-xs text-slate-400">
              {participante ? `${participante.codigo} · ${participante.nombre}` : "Validación de Certificados"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5 flex-grow overflow-y-auto">
          {/* Vista previa del QR Canvas */}
          <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <canvas
              ref={canvasRef}
              className="max-w-[260px] max-h-[260px] w-full h-auto shadow-sm rounded-xl bg-white border border-slate-100 dark:border-slate-700"
            />
            <span className="text-[11px] text-slate-400 font-medium mt-2">
              Logo institucional central con corrección de error nivel H
            </span>
          </div>

          {/* Opciones de Contenido */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Tipo de Enlace / Datos:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setModo("url")}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    modo === "url"
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  URL Verificación
                </button>
                <button
                  type="button"
                  onClick={() => setModo("codigo")}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    modo === "codigo"
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  Solo Código
                </button>
                <button
                  type="button"
                  onClick={() => setModo("personalizado")}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    modo === "personalizado"
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-600"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  Personalizado
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Contenido codificado en el QR:
              </label>
              <input
                type="text"
                value={contenido}
                onChange={(e) => {
                  setContenido(e.target.value);
                  setModo("personalizado");
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Ajustes de imagen */}
            <div className="flex flex-col gap-3 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incluirLogo}
                    onChange={(e) => setIncluirLogo(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
                  />
                  <span>Incluir Logo DPW al centro</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Diseño:</span>
                  <select
                    value={estiloQR}
                    onChange={(e) => setEstiloQR(e.target.value as "elegante" | "clasico")}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer"
                  >
                    <option value="elegante">Elegante (Redondeado)</option>
                    <option value="clasico">Clásico (Cuadrado)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="font-medium text-slate-600 dark:text-slate-400">Tamaño:</span>
                <select
                  value={tamano}
                  onChange={(e) => setTamano(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer"
                >
                  <option value={400}>Normal (400 px)</option>
                  <option value={600}>Alta Calidad (600 px)</option>
                  <option value={1000}>Imprenta (1000 px)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
          >
            Cerrar
          </button>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleImprimir}
              className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDescargarSVG}
              className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Descargar en formato vectorial SVG"
            >
              <svg className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>SVG Vector</span>
            </button>

            <button
              type="button"
              onClick={handleDescargar}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Descargar PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
