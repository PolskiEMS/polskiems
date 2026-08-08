import { Metadata } from 'next';
import FoundProducers from '../components/FoundProducers/FoundProducers';
import styles from './styles.module.css'
import Link from 'next/link';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Firmy EMS i producenci elektroniki w Polsce – wyniki wyszukiwania",
  description:
    "Sprawdź dopasowane firmy EMS i producentów elektroniki w Polsce. Porównaj usługi montażu SMD, THT, PCB, lokalizację oraz skalę produkcji.",
  keywords: [
    "firmy EMS",
    "producenci elektroniki Polska",
    "montaż elektroniki",
    "montaż SMD",
    "montaż THT",
    "montaż PCB",
    "produkcja elektroniki",
    "kontraktowa produkcja elektroniki",
  ],
  alternates: {
    canonical: "https://polskiems.pl/producenci",
  },
  openGraph: {
    title: "Firmy EMS i producenci elektroniki w Polsce",
    description:
      "Porównaj producentów elektroniki i firmy EMS według usług, lokalizacji oraz skali produkcji.",
    url: "https://polskiems.pl/producenci",
    siteName: "PolskiEMS",
    locale: "pl_PL",
    type: "website",
  },
};


const Wyszukaj = () => {
  return (
    <div className={styles.page}>
      <h1>Wyszukani Producenci</h1>
      <FoundProducers />
      <Link href={'/api/formularz-v2'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>
    </div>
  );
}

export default Wyszukaj;
