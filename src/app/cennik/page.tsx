import Link from 'next/link';
import styles from './styles.module.css'

const packages = [
  {
    key: 'free',
    name: 'FREE',
    ctaLabel: 'Wybierz Free',
    price: '0 zł / mies.',
    features: [
      'Widoczność firmy w katalogu',
      'Profil firmy (nazwa, email, strona www)',
      'Start bez opłat miesięcznych',
    ]
  },
  {
    key: 'standard',
    name: 'STANDARD',
    ctaLabel: 'Wybierz Standard',
    price: '199 zł / mies.',
    features: [
      'Większa widoczność firmy w katalogu',
      'Możliwość otrzymywania zapytań ofertowych',
      'Lepsza ekspozycja oferty',
      'Szybszy kontakt z potencjalnymi klientami'
    ]
  },
  {
    key: 'premium',
    name: 'PREMIUM',
    ctaLabel: 'Wybierz Premium',
    price: '299 zł / mies.',
    features: [
      'Wszystko ze STANDARD',
      'Najwyższa pozycja i dodatkowe wyróżnienie',
      'Priorytetowa obsługa zapytań',
      'Maksymalne limity funkcji i widoczności'
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
