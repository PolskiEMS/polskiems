import Link from 'next/link';
import PackageCheckout from '../cennik/PackageCheckout';
import FreePackageSignup from './FreePackageSignup';
import styles from './styles.module.css';

type SearchParams = {
  pakiet?: string;
};

const packageDescriptions: Record<string, string> = {
  free: 'Pakiet startowy dla firm rozpoczynających obecność w katalogu — bez płatności online.',
  standard: 'Najlepszy wybór dla firm, które chcą regularnie pozyskiwać zapytania ofertowe.',
  premium: 'Maksymalna widoczność i priorytetowa ekspozycja w katalogu.'
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

  return (
    <div className={styles.page}>
      <h1>Aktywacja pakietu</h1>
      <p className={styles.note}>Dokończ konfigurację i uruchom pakiet dla swojej firmy.</p>

      <section className={styles.summaryCard}>
        <h2>Wybrany pakiet</h2>
        <p className={styles.selectedPackage}>{selectedPackage.toUpperCase()}</p>
        <p>{packageDescriptions[selectedPackage]}</p>
        <p className={styles.muted}>
          Krótkie podsumowanie: {selectedPackage === 'free'
            ? 'pakiet FREE aktywuje widoczność firmy bez płatności.'
            : 'po płatności pakiet aktywuje się automatycznie, a konto otrzyma odpowiednie limity i funkcje.'}
        </p>
      </section>

      {selectedPackage === 'free' ? <FreePackageSignup /> : <PackageCheckout />}

      <p className={styles.backLinkWrap}>
        <Link href={`/cennik?pakiet=${selectedPackage}`} className={styles.backLink}>Wróć do cennika</Link>
      </p>
    </div>
  );
}
