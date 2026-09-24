import Image from "next/image";

/** Marca de agua con logo DPW — fija, detrás de todo el contenido */
export default function WatermarkBg() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.06]"
      aria-hidden="true"
    >
      <Image
        src="/logo_dpw.png"
        alt=""
        fill
        className="object-contain object-center"
        style={{ maxWidth: 600, maxHeight: 600, margin: "auto" }}
        priority
      />
    </div>
  );
}
