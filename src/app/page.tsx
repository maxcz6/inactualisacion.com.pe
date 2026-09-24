import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FormularioBusqueda from "@/components/certificados/FormularioBusqueda";
import { countAll } from "@/server/repositories/participante.repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const total = await countAll();

  return (
    <main id="student-layout">
      <div className="flex flex-col min-h-screen">
        <Header />

        <div className="flex-grow w-full">
          <FormularioBusqueda total={total} />
        </div>

        <Footer />
      </div>
    </main>
  );
}
