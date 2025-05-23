import { Metadata } from 'next';
import FoundProducers from '../components/FoundProducers/FoundProducers';
import styles from './styles.module.css'
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Wyniki Wyszukiwania Producentów Elektroniki",
  description: "Przeglądaj producentów, którzy spełniają Twoje kryteria wyszukiwania: region, wymagania techniczne i skala produkcji.",
  keywords: [
    "wyniki wyszukiwania producentów",
    "produkcja elektroniki wyniki",
    "wyszukiwarka EMS wyniki",
    "dopasowani producenci PCB"
  ],
  openGraph: {
    title: "Dopasowani Producenci Elektroniki",
    description: "Sprawdź, którzy producenci spełniają Twoje wymagania i znajdź idealnego partnera do produkcji.",
    // url: "https://twoja-strona.pl/producenci",
    siteName: "Wyszukiwarka Producentów",
    locale: "pl_PL",
    type: "website"
  }
};


const Wyszukaj = () => {
  return (
    <div className={styles.page}>
      <h1>Wyszukani Producenci</h1>
      <FoundProducers />
      <Link href={'formularz_zgloszeniowy_firmy.docx'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>
    </div>
  );
}

export default Wyszukaj;