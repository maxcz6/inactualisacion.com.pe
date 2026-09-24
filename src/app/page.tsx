import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FormularioBusqueda from "@/components/certificados/FormularioBusqueda";
import FaqSection from "@/components/certificados/FaqSection";
import { countAll } from "@/server/repositories/participante.repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const total = await countAll();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Header />

      <main className="flex-grow w-full">
        <FormularioBusqueda total={total} />
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
