import { Metadata } from 'next';
import ProducerSearch from '../components/ProducerSearch/ProducerSearch';
import styles from './styles.module.css'
import PageViewTracker from '../components/PageViewTracker';

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
    <div className={styles.page}>
      <PageViewTracker page="search" />
      <div className={styles.topPage}>
        <h1>Wyszukaj Producenta</h1>
        <p>Wybierz opcje</p>
      </div>
      <ProducerSearch />
    </div>
  );
}

export default Wyszukaj;
