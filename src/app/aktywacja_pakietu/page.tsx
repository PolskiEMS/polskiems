import Link from 'next/link';
import PackageCheckout from '../cennik/PackageCheckout';
import { getAllDzialaniaEms, getAllProdukcjaScales, getAllRegion } from '@/lib/actions';
import styles from './styles.module.css';

export const dynamic = "force-dynamic";

type SearchParams = {
  pakiet?: string;
};

const packageDescriptions: Record<string, string> = {
  free: 'Pakiet startowy dla firm rozpoczynających obecność w katalogu.',
  standard: 'Pełny profil, większa widoczność i miesięczny raport skuteczności.',
  premium: 'Maksymalna ekspozycja, nielimitowane RFQ i rozszerzona analityka.'
};

export default async function AktywacjaPakietuPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedPackage = resolvedSearchParams.pakiet === 'premium'
    ? 'premium'
    : resolvedSearchParams.pakiet === 'free'
      ? 'free'
      : 'standard';
  const [produkcja, regions] = await Promise.all([
    getAllProdukcjaScales(),
    getAllRegion(),
  ]);

  return (
    <div className={styles.page}>
      <h1>Aktywacja pakietu</h1>
      <p className={styles.note}>Dokończ konfigurację i uruchom pakiet dla swojej firmy.</p>

      <section className={styles.summaryCard}>
        <h2>Wybrany pakiet</h2>
        <p className={styles.selectedPackage}>{selectedPackage.toUpperCase()}</p>
        <p>{packageDescriptions[selectedPackage]}</p>
        <p className={styles.muted}>FREE jest bezpłatny. Pakiety Standard i Premium wymagają płatnej aktywacji; publiczna aktywacja bez opłaty została wyłączona.</p>
      </section>

      <PackageCheckout initialPackage={selectedPackage} regions={regions} produkcja={produkcja} />

      <p className={styles.backLinkWrap}>
        <Link href={`/cennik?pakiet=${selectedPackage}`} className={styles.backLink}>Wróć do cennika</Link>
      </p>
    </div>
  );
}
