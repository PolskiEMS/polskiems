import Link from 'next/link';
import { Suspense } from 'react';
import styles from './styles.module.css'
import PackageCheckout from './PackageCheckout';

const packages = [
  {
    key: 'free',
    name: 'FREE',
    price: '0 zł / mies.',
    badge: 'Start',
    ctaLabel: 'Pakiet aktywny',
    ctaHref: '/formularz_zgloszeniowy_firmy.docx',
    features: [
      'Widoczność w katalogu',
      'Profil firmy (nazwa, email, strona www)',
      'Brak wyróżnienia',
    ]
  },
  {
    key: 'standard',
    name: 'STANDARD',
    price: '199 zł / mies.',
    badge: 'Najczęściej wybierany',
    ctaLabel: 'Aktywuj STANDARD',
    ctaHref: '/cennik?pakiet=standard#checkout',
    features: [
      'Wszystko z FREE + odbieranie leadów',
      'Badge Standard',
      'Wyróżnienie + pełne statystyki',
      'Limit: do 10 zapytań / miesiąc'
    ]
  },
  {
    key: 'premium',
    name: 'PREMIUM',
    price: '299 zł / mies.',
    badge: 'Top',
    ctaLabel: 'Aktywuj PREMIUM',
    ctaHref: '/cennik?pakiet=premium#checkout',
    features: [
      'Wszystko z STANDARD',
      'Złoty badge Premium + najwyższa pozycja',
      'Priorytetowa obsługa zapytań',
      'Brak realnego limitu zapytań'
    ]
  }
];

const paymentFlow = [
  {
    title: '1. Wybór pakietu',
    description: 'Firma wybiera Standard albo Premium w panelu / na stronie cennika.'
  },
  {
    title: '2. Płatność',
    description: 'Przekierowanie do bramki Stripe lub Przelewy24 i opłacenie subskrypcji.'
  },
  {
    title: '3. Webhook',
    description: 'Po potwierdzeniu płatności oznacza transakcję jako paid i zapisuje event.'
  },
  {
    title: '4. Aktywacja',
    description: 'System ustawia Pakiet, limit leadów i datę kolejnego rozliczenia.'
  }
];

const CennikPage = () => {
  return (
    <div className={styles.page}>
      <h1>Cennik pakietów</h1>
      <p className={styles.note}>Poniżej model pakietów docelowych dla PolskieEMS.</p>

      <section className={styles.packageGrid}>
        {packages.map((item) => (
          <article
            key={item.key}
            className={`${styles.packageCard} ${item.key === 'premium' ? styles.premiumCard : ''}`}
          >
            <div className={styles.packageHeader}>
              <h2>{item.name}</h2>
              <span className={`${styles.badge} ${item.key === 'premium' ? styles.badgePremium : ''}`}>
                {item.badge}
              </span>
            </div>
            <div className={styles.price}>{item.price}</div>
            <ul>
              {item.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link href={item.ctaHref} className={styles.packageCta}>
              {item.ctaLabel}
            </Link>
          </article>
        ))}
      </section>

      <section className={styles.flowSection}>
        <h3>Jak wygląda płatność i aktywacja pakietu?</h3>

        <div className={styles.gatewayRow}>
          <div className={styles.gatewayCard}>
            <strong>Stripe</strong>
            <p>Karta, Apple Pay / Google Pay, cykliczna subskrypcja i webhook aktywujący pakiet.</p>
          </div>
          <div className={styles.gatewayCard}>
            <strong>Przelewy24</strong>
            <p>BLIK i szybkie przelewy dla PL; po statusie uruchamiamy automatycznie aktywację.</p>
          </div>
        </div>

        <div className={styles.flowGrid}>
          {paymentFlow.map((step) => (
            <article key={step.title} className={styles.flowCard}>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <Suspense fallback={null}>
        <PackageCheckout />
      </Suspense>

      <Link href={'formularz_zgloszeniowy_firmy.docx'}>
        <button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button>
      </Link>
    </div>
  );
}

export default CennikPage;
