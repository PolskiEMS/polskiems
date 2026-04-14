export const dynamic = 'force-dynamic'

import { getAllProducers } from '../../lib/actions';
import styles from './styles.module.css'
import AllProducers from '../components/AllProducers/AllProducers';
import { Metadata } from 'next';
import Link from 'next/link';
import PageViewTracker from '../components/PageViewTracker';

export const metadata: Metadata = {
  title: "Lista Wszystkich Producentów Elektroniki",
  description: "Pełna lista producentów elektroniki w Polsce. Przeglądaj firmy EMS i dostawców usług montażu PCB bez filtrowania.",
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
  }
};

const Wyszukaj = async () => {
  const producers = await getAllProducers();
  return (
    <div className={styles.page}>
      <PageViewTracker page="all-producers" />
      <h1>Wszyscy Producenci</h1>
      <AllProducers producers={producers} />
      <Link href={'formularz_zgloszeniowy_firmy.docx'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>
    </div>
  );
}

export default Wyszukaj;
