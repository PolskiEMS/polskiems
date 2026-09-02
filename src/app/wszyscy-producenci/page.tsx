export const dynamic = "force-dynamic";

import { getAllProducers } from '../../lib/actions';
import styles from './styles.module.css'
import AllProducers from '../components/AllProducers/AllProducers';
import { Metadata } from 'next';
import Link from 'next/link';
import PageViewTracker from '../components/PageViewTracker';

export const metadata: Metadata = {
  title: "Wszyscy producenci elektroniki w Polsce | Baza firm EMS | PolskiEMS",
  description:
    "Przeglądaj pełną bazę producentów elektroniki i firm EMS w Polsce. Porównaj profile dostawców bez filtrowania i znajdź partnera do projektu.",
  keywords: [
    "lista producentów elektroniki",
    "pełna baza EMS",
    "PCB producenci Polska",
    "wszyscy producenci elektroniki"
  ],
  openGraph: {
    title: "Wszyscy Producenci Elektroniki",
    description: "Zobacz wszystkich producentów elektroniki w bazie bez żadnych filtrów.",
    url: "https://polskiems.pl/wszyscy-producenci",
    siteName: "Wyszukiwarka Producentów",
    locale: "pl_PL",
    type: "website"
  },
  alternates: {
    canonical: "https://polskiems.pl/wszyscy-producenci",
  },
};

const Wyszukaj = async () => {
  let producers: Awaited<ReturnType<typeof getAllProducers>> = [];
  let databaseUnavailable = false;
  try {
    producers = await getAllProducers();
  } catch {
    databaseUnavailable = true;
    console.error("All producers query failed");
  }
  return (
    <div className={styles.page}>
      <PageViewTracker page="all-producers" />
      <h1>Wszyscy Producenci</h1>
      {databaseUnavailable && <p role="alert">Lista producentów jest chwilowo niedostępna. Spróbuj ponownie później.</p>}
      <AllProducers producers={producers} />
      <Link href={'/dodaj-producenta'}><button className={styles.chceZnalezcSie}>Dodaj firmę EMS</button></Link>
    </div>
  );
}

export default Wyszukaj;
