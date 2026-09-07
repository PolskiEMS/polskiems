import { Metadata } from "next";
import ProducerSearch from "../components/ProducerSearch/ProducerSearch";
import PageViewTracker from "../components/PageViewTracker";
import { getPublicSupplierSearchOptions } from "@/lib/publicSupplierTaxonomyActions";
import styles from "./styles.module.css";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const metadata: Metadata = {
  title: "Wyszukaj producenta elektroniki w Polsce | Filtry EMS | PolskiEMS",
  description:
    "Wybierz usługi, możliwości technologiczne, branże, certyfikaty, typ firmy, lokalizację i skalę produkcji, aby znaleźć producenta elektroniki w Polsce.",
  keywords: [
    "wyszukiwarka producentów elektroniki",
    "EMS wyszukiwanie",
    "produkcja elektroniki Polska",
    "filtruj producentów PCB",
    "certyfikaty EMS",
    "możliwości technologiczne EMS",
  ],
  openGraph: {
    title: "Wyszukiwarka Producentów Elektroniki",
    description: "Znajdź producenta elektroniki według usług, możliwości, branż, certyfikatów, lokalizacji i skali produkcji.",
    url: "https://polskiems.pl/wyszukaj",
    siteName: "Wyszukiwarka Producentów",
    locale: "pl_PL",
    type: "website",
  },
  alternates: {
    canonical: "https://polskiems.pl/wyszukaj",
  },
};

export default async function Wyszukaj() {
  const options = await getPublicSupplierSearchOptions();

  return (
    <main className={styles.page}>
      <PageViewTracker page="search" />
      <section className={styles.hero}>
        <p className={styles.kicker}>Wyszukiwarka EMS</p>
        <h1>Znajdź producenta elektroniki dopasowanego do projektu</h1>
        <p className={styles.lead}>
          Wpisz nazwę firmy, usługę albo wybierz filtry. PolskiEMS pomaga zawęzić listę producentów według usług,
          możliwości technologicznych, branż, certyfikatów, typu firmy, lokalizacji i skali produkcji.
        </p>
      </section>
      <ProducerSearch options={options} />
    </main>
  );
}
