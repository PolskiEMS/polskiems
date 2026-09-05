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

const WszyscyProducenci = async () => {
  let producers: Awaited<ReturnType<typeof getAllProducers>> = [];
  let databaseUnavailable = false;
  try {
    producers = await getAllProducers();
  } catch {
    databaseUnavailable = true;
    console.error("All producers query failed");
  }
  return (
    <main className={styles.page}>
      <PageViewTracker page="all-producers" />
      <section className={styles.hero}>
        <p className={styles.kicker}>Baza producentów</p>
        <h1>Wszyscy producenci elektroniki w PolskiEMS</h1>
        <p className={styles.lead}>
          Przeglądaj firmy EMS i producentów elektroniki w Polsce. Wejdź w profil, sprawdź opis, lokalizację i wyślij zapytanie ofertowe.
        </p>
        <div className={styles.heroActions}>
          <Link href="/wyszukaj" className={styles.primaryAction}>Przejdź do wyszukiwarki</Link>
          <Link href="/dodaj-producenta" className={styles.secondaryAction}>Dodaj firmę EMS</Link>
        </div>
      </section>

      {databaseUnavailable && (
        <p className={styles.alert} role="alert">Lista producentów jest chwilowo niedostępna. Spróbuj ponownie później.</p>
      )}

      <AllProducers producers={producers} />
    </main>
  );
}

export default WszyscyProducenci;
