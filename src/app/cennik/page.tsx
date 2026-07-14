import Link from 'next/link';
import styles from './styles.module.css'

const packages = [
  {
    key: 'free',
    name: 'FREE',
    ctaLabel: 'Wybierz Free',
    price: '0 zł / msc.',
    description: 'Dla firm, które chcą być obecne w katalogu PolskiEMS i umożliwić podstawowy kontakt.',
    features: [
      'Obecność firmy w katalogu',
      'Podstawowy profil firmy',
      'Dane kontaktowe i zakres usług',
      'Do 5 zapytań ofertowych miesięcznie',
      'Start bez opłat miesięcznych',
    ]
  },
  {
    key: 'standard',
    name: 'STANDARD',
    ctaLabel: 'Wybierz Standard',
    badge: 'Najczęściej wybierany',
    price: '199 zł / msc.',
    description: 'Dla firm, które chcą lepiej zaprezentować ofertę i zbudować bardziej profesjonalny profil w katalogu.',
    features: [
      'Cennik okresów: 1 mies. 199 zł | 3 mies. 549 zł | 6 mies. 999 zł | 12 mies. 1799 zł',
      'Profesjonalny profil firmy',
      'Lepsza widoczność w katalogu',
      'Wyróżniona prezentacja oferty',
      'Do 20 zapytań ofertowych miesięcznie',
      'Miesięczny raport statystyk',
    ]
  },
  {
    key: 'premium',
    name: 'PREMIUM',
    ctaLabel: 'Wybierz Premium',
    badge: 'Największa widoczność',
    price: '299 zł / msc.',
    description: 'Dla firm, które chcą wyróżnić się w katalogu, zwiększyć widoczność i korzystać z rozszerzonej analityki profilu.',
    features: [
      'Cennik okresów: 1 mies. 299 zł | 3 mies. 849 zł | 6 mies. 1599 zł | 12 mies. 2999 zł',
      'Najwyższa widoczność w katalogu',
      'Priorytetowe pozycjonowanie firmy',
      'Wyróżniona karta producenta',
      'Nielimitowane zapytania ofertowe',
      'Rozszerzony raport i zaawansowana analityka',
    ]
  }
];

const comparisonRows = [
  {
    feature: 'Cena miesięczna',
    free: '0 zł',
    standard: '199 zł',
    premium: '299 zł',
  },
  {
    feature: 'Okresy płatności',
    free: 'Bez opłat miesięcznych',
    standard: '1, 3, 6 lub 12 miesięcy',
    premium: '1, 3, 6 lub 12 miesięcy',
  },
  {
    feature: 'Profil firmy',
    free: 'Podstawowy',
    standard: 'Profesjonalny',
    premium: 'Profesjonalny i wyróżniony',
  },
  {
    feature: 'Widoczność w katalogu',
    free: 'Standardowa',
    standard: 'Lepsza widoczność',
    premium: 'Najwyższa widoczność i priorytet',
  },
  {
    feature: 'Zapytania ofertowe miesięcznie',
    free: 'Do 5',
    standard: 'Do 20',
    premium: 'Bez limitu',
  },
  {
    feature: 'Raport statystyk',
    free: '—',
    standard: 'Miesięczny raport',
    premium: 'Rozszerzony raport i analityka',
  },
];

const activationFlow = [
  {
    title: '1. Wybór pakietu',
    description: 'Wybierz pakiet najlepiej dopasowany do potrzeb Twojej firmy.'
  },
  {
    title: '2. Kontakt',
    description: 'Do czasu uruchomienia płatności online skontaktuj się z PolskiEMS w sprawie wcześniejszej aktywacji pakietu.'
  },
  {
    title: '3. Potwierdzenie',
    description: 'Administrator potwierdzi dostępność pakietu i przekaże dalsze kroki aktywacji.'
  },
  {
    title: '4. Aktywacja',
    description: 'Pakiet zostaje aktywowany, a konto firmy otrzymuje odpowiednie limity i funkcje.'
  }
];

const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';
const contactHref = '/kontakt';

const CennikPage = () => {
  return (
    <div className={styles.page}>
      <h1>Cennik pakietów</h1>
      <p className={styles.note}>Wybierz rozwiązanie dopasowane do etapu rozwoju Twojej firmy.</p>

      {!paymentsEnabled && (
        <div className={styles.paymentsNotice}>
          Zakup pakietów online jest obecnie w trakcie uruchamiania. Cennik pozostaje aktualny. W sprawie wcześniejszej aktywacji pakietu skontaktuj się z PolskiEMS.
        </div>
      )}

      <section className={styles.packageGrid}>
        {packages.map((item) => (
          <article
            key={item.key}
            className={`${styles.packageCard} ${item.key === 'premium' ? styles.premiumCard : ''}`}
          >
            <div className={styles.packageHeader}>
              <h2>{item.name}</h2>
              {'badge' in item && item.badge && <span className={styles.packageBadge}>{item.badge}</span>}
            </div>
            <div className={styles.price}>{item.price}</div>
            {'description' in item && item.description && <p>{item.description}</p>}
            <ul>
              {item.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className={styles.packageActions}>
              {paymentsEnabled ? (
                <Link href={`/aktywacja_pakietu?pakiet=${item.key}`} className={styles.packageCta}>
                  Wybierz pakiet
                </Link>
              ) : (
                <button type="button" className={styles.disabledPackageCta} disabled aria-disabled="true">
                  Płatności w trakcie uruchamiania
                </button>
              )}
              <Link href={contactHref} className={styles.contactPackageCta}>
                Skontaktuj się w sprawie pakietu
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.comparisonSection}>
        <h3>Porównanie pakietów</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Funkcja</th>
                <th>FREE</th>
                <th>STANDARD</th>
                <th>PREMIUM</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">{row.feature}</th>
                  <td>{row.free}</td>
                  <td>{row.standard}</td>
                  <td>{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.flowSection}>
        <h3>Jak działa aktywacja pakietu</h3>
        <div className={styles.flowGrid}>
          {activationFlow.map((step) => (
            <article key={step.title} className={styles.flowCard}>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.benefitsSection}>
        <h3>Dlaczego firmy wybierają PolskiEMS?</h3>
        <ul className={styles.benefitsList}>
          <li>Jeden katalog, w którym klienci łatwo porównują producentów i szybko znajdują właściwego partnera.</li>
          <li>Przejrzyste pakiety, które można skalować wraz z rozwojem firmy — od FREE do PREMIUM.</li>
          <li>Prosty proces aktywacji i szybkie uruchomienie profilu bez zbędnych formalności.</li>
        </ul>
      </section>

      <section className={styles.ctaSection}>
        <h3>Gotowy na aktywację?</h3>
        <p>{paymentsEnabled ? 'Przejdź dalej i dokończ aktywację pakietu dla swojej firmy.' : 'Aktywacja online jest tymczasowo wyłączona — skontaktuj się z nami, aby omówić pakiet.'}</p>
        {paymentsEnabled ? (
          <Link href="/aktywacja_pakietu" className={styles.finalCta}>Przejdź do aktywacji pakietu</Link>
        ) : (
          <div className={styles.finalActions}>
            <button type="button" className={styles.disabledFinalCta} disabled aria-disabled="true">
              Płatności w trakcie uruchamiania
            </button>
            <Link href={contactHref} className={styles.finalCta}>Skontaktuj się w sprawie pakietu</Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default CennikPage;
