import Link from "next/link";
import styles from "./styles.module.css";
import { PACKAGE_PLANS, type PackageType } from "@/lib/packagePlans";

const packageOrder: PackageType[] = ["free", "standard", "premium"];

const comparisonRows = [
  {
    feature: "Cena miesięczna",
    free: "0 zł",
    standard: "199 zł",
    premium: "299 zł",
  },
  {
    feature: "Profil firmy",
    free: "Podstawowy",
    standard: "Pełny",
    premium: "Pełny i wyróżniony",
  },
  {
    feature: "Zakres danych profilu",
    free: "Podstawowe dane i usługi",
    standard: "Usługi, technologie, branże i certyfikaty",
    premium: "Pełny zakres + wyróżnienie",
  },
  {
    feature: "Widoczność w katalogu",
    free: "Standardowa",
    standard: "Wyżej niż Free",
    premium: "Najwyższy priorytet domyślnego sortowania",
  },
  {
    feature: "Zapytania ofertowe miesięcznie",
    free: "Do 5",
    standard: "Do 20",
    premium: "Bez limitu",
  },
  {
    feature: "Raport statystyk",
    free: "—",
    standard: "Miesięczny raport skuteczności",
    premium: "Rozszerzony raport i analityka",
  },
  {
    feature: "Analityka",
    free: "—",
    standard: "Wyświetlenia, kliknięcia i podstawowy CTR",
    premium: "CTR, potencjał leadowy i rekomendacje",
  },
  {
    feature: "RFQ auto-match",
    free: "Dopasowanie techniczne",
    standard: "Dopasowanie techniczne",
    premium: "Dopasowanie techniczne + priorytet pomocniczy przy remisie",
  },
];

const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

function priceLine(packageType: PackageType) {
  if (packageType === "free") return "0 zł / mies.";
  const plan = PACKAGE_PLANS[packageType];
  return `${plan.priceMonthly} zł / mies.`;
}

function periodPricing(packageType: PackageType) {
  if (packageType === "free") return null;
  const prices = PACKAGE_PLANS[packageType].prices;
  return `1 mies. ${prices[1]} zł | 3 mies. ${prices[3]} zł | 6 mies. ${prices[6]} zł | 12 mies. ${prices[12]} zł`;
}

export default function CennikPage() {
  return (
    <div className={styles.page}>
      <h1>Cennik pakietów</h1>
      <p className={styles.note}>
        FREE daje podstawową obecność. STANDARD rozwija profil i analitykę. PREMIUM zwiększa ekspozycję i możliwości pozyskiwania projektów.
      </p>

      {!paymentsEnabled && (
        <div className={styles.paymentsNotice}>
          Pakiet FREE można zgłosić bezpłatnie. Aktywacja płatnych pakietów Standard i Premium online jest obecnie w trakcie uruchamiania.
        </div>
      )}

      <section className={styles.packageGrid}>
        {packageOrder.map((key) => {
          const plan = PACKAGE_PLANS[key];
          const paidPricing = periodPricing(key);

          return (
            <article
              key={key}
              className={`${styles.packageCard} ${key === "premium" ? styles.premiumCard : ""}`}
            >
              <div className={styles.packageHeader}>
                <h2>{plan.name}</h2>
                {key === "standard" && <span className={styles.packageBadge}>Pełny profil</span>}
                {key === "premium" && <span className={styles.packageBadge}>Największa ekspozycja</span>}
              </div>

              <div className={styles.price}>{priceLine(key)}</div>
              <p>{plan.description}</p>

              <ul>
                {paidPricing && <li>{paidPricing}</li>}
                {plan.publicBenefits.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className={styles.packageActions}>
                {key === "free" ? (
                  <Link href="/dodaj-producenta?pakiet=free#formularz" className={styles.packageCta}>
                    Dodaj firmę bezpłatnie
                  </Link>
                ) : paymentsEnabled ? (
                  <Link href={`/aktywacja_pakietu?pakiet=${key}`} className={styles.packageCta}>
                    Wybierz {plan.name}
                  </Link>
                ) : (
                  <>
                    <button type="button" className={styles.disabledPackageCta} disabled aria-disabled="true">
                      Płatności w trakcie uruchamiania
                    </button>
                    <Link href="/kontakt" className={styles.contactPackageCta}>
                      Zapytaj o {plan.name}
                    </Link>
                  </>
                )}
              </div>
            </article>
          );
        })}
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
        <h3>Jak działa publikacja firmy</h3>
        <div className={styles.flowGrid}>
          <article className={styles.flowCard}>
            <h4>1. Zgłoszenie</h4>
            <p>Firma uzupełnia dane, kompetencje i wybiera pakiet.</p>
          </article>
          <article className={styles.flowCard}>
            <h4>2. Weryfikacja</h4>
            <p>Każde nowe zgłoszenie jest sprawdzane przez administratora przed publikacją.</p>
          </article>
          <article className={styles.flowCard}>
            <h4>3. Aktywacja</h4>
            <p>FREE jest bezpłatny. Standard i Premium wymagają potwierdzenia płatnej aktywacji.</p>
          </article>
          <article className={styles.flowCard}>
            <h4>4. Publikacja i RFQ</h4>
            <p>Po aktywacji profil bierze udział w wyszukiwaniu i dopasowaniach zapytań ofertowych.</p>
          </article>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <h3>Chcesz dołączyć firmę?</h3>
        <p>Zacznij od zgłoszenia danych i kompetencji. Profil zostanie opublikowany po weryfikacji.</p>
        <div className={styles.finalActions}>
          <Link href="/dodaj-producenta" className={styles.finalCta}>Dodaj firmę do PolskiEMS</Link>
          <Link href="/kontakt" className={styles.contactPackageCta}>Skontaktuj się z PolskiEMS</Link>
        </div>
      </section>
    </div>
  );
}
