import Link from 'next/link';
import styles from './styles.module.css'

const packages = [
  {
    key: 'free',
    name: 'FREE',
    ctaLabel: 'Wybierz Free',
    price: '0 zł / mies.',
    features: [
      'Ograniczona widoczność firmy w katalogu',
      '❌ ograniczone dane firmy',
      'Start bez opłat miesięcznych',
    ]
  },
  {
    key: 'standard',
    name: 'STANDARD',
    ctaLabel: 'Wybierz Standard',
    badge: 'Najczęściej wybierany',
    price: '199 zł / mies.',
    features: [
      'Cennik okresów: 1 mies. 199 zł, 3 mies. 549 zł, 6 mies. 999 zł, 12 mies. 1799 zł',
      'Większa widoczność firmy w katalogu',
      'Pełne dane kontaktowe',
      '🔥 Do 10 zapytań ofertowych miesięcznie',
      '🔥 Wyróżnienie w katalogu',
      '📈 Miesięczny raport skuteczności',
    ]
  },
  {
    key: 'premium',
    name: 'PREMIUM',
    ctaLabel: 'Wybierz Premium',
    badge: 'Dla poważnych Firm',
    price: '299 zł / mies.',
    features: [
      'Cennik okresów: 1 mies. 299 zł, 3 mies. 849 zł, 6 mies. 1599 zł, 12 mies. 2999 zł',
      '🔥 Nielimitowane zapytania ofertowe',
      '🥇 TOP pozycja w katalogu',
      '🔥 Priorytetowa obsługa leadów',
      '✅ Wyróżnienie w katalogu (2–3x więcej wyświetleń)',
      '📈 Zaawansowana analityka + raport miesięczny',
    ]
  }
];

const activationFlow = [
  {
    title: '1. Wybór pakietu',
    description: 'Wybierz pakiet najlepiej dopasowany do potrzeb Twojej firmy.'
  },
  {
    title: '2. Płatność',
    description: 'Po wyborze płatnego pakietu przechodzisz do bezpiecznej płatności online.'
  },
  {
    title: '3. Potwierdzenie',
    description: 'System automatycznie potwierdza transakcję i zapisuje płatność.'
  },
  {
    title: '4. Aktywacja',
    description: 'Pakiet zostaje aktywowany, a konto firmy otrzymuje odpowiednie limity i funkcje.'
  }
];

const paidPackageBenefits = [
  'większą widoczność firmy w katalogu',
  'możliwość otrzymywania zapytań ofertowych',
  'lepszą ekspozycję oferty',
  'szybszy kontakt z potencjalnymi klientami'
];

const CennikPage = () => {
  return (
    <div className={styles.page}>
      <h1>Cennik pakietów</h1>
      <p className={styles.note}>Wybierz rozwiązanie dopasowane do etapu rozwoju Twojej firmy.</p>

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
            <ul>
              {item.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link href={`/aktywacja_pakietu?pakiet=${item.key}`} className={styles.packageCta}>
              Wybierz pakiet
            </Link>
          </article>
        ))}
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
        <h3>Co zyskujesz z płatnym pakietem?</h3>
        <ul className={styles.benefitsList}>
          {paidPackageBenefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      </section>

      <section className={styles.ctaSection}>
        <h3>Gotowy na aktywację?</h3>
        <p>Przejdź dalej i dokończ aktywację pakietu dla swojej firmy.</p>
        <Link href="/aktywacja_pakietu" className={styles.finalCta}>Przejdź do aktywacji pakietu</Link>
      </section>
    </div>
  );
}

export default CennikPage;
