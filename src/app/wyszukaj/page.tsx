import { Metadata } from 'next';
import ProducerSearch from '../components/ProducerSearch/ProducerSearch';
import styles from './styles.module.css'
import PageViewTracker from '../components/PageViewTracker';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wyszukaj producenta elektroniki w Polsce | Filtry EMS | PolskiEMS",
  description: "Wybierz region, wymagania i skalę produkcji, aby znaleźć najlepszego producenta elektroniki dopasowanego do Twoich potrzeb.",
  keywords: [
    "wyszukiwarka producentów elektroniki",
    "EMS wyszukiwanie",
    "produkcja elektroniki Polska",
    "filtruj producentów PCB"
  ],
  openGraph: {
    title: "Wyszukiwarka Producentów Elektroniki",
    description: "Znajdź producenta elektroniki według lokalizacji, wymagań i skali produkcji.",
    url: "https://polskiems.pl/wyszukaj",
    siteName: "Wyszukiwarka Producentów",
    locale: "pl_PL",
    type: "website"
  },
  alternates: {
    canonical: "https://polskiems.pl/wyszukaj",
  },
};

const Wyszukaj = () => {
  return (
    <main className={styles.page}>
      <PageViewTracker page="search" />
      <section className={styles.hero}>
        <p className={styles.kicker}>Wyszukiwarka EMS</p>
        <h1>Znajdź producenta elektroniki dopasowanego do projektu</h1>
        <p className={styles.lead}>
          Wpisz nazwę firmy, usługę albo wybierz filtry. PolskiEMS pomoże zawęzić listę producentów według lokalizacji,
          usług EMS i skali produkcji.
        </p>
      </section>
      <ProducerSearch />
    </main>
  );
}

export default Wyszukaj;
