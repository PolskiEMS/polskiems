import type { Metadata } from "next";
import Link from "next/link";
import styles from "../seo-page.module.css";

export const metadata: Metadata = {
  title: "EMS wielkopolskie | Firmy montażu elektroniki | PolskiEMS",
  description: "Szukasz firmy EMS w Wielkopolsce? Porównaj producentów elektroniki realizujących montaż SMT, THT i projekty kontraktowe.",
};

export default function Page() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Firmy EMS w województwie wielkopolskim</h1>
        <p>
          Ta podstrona pomaga znaleźć producentów elektroniki działających w regionie Wielkopolska i Poznań.
          W katalogu PolskiEMS możesz porównać profile firm i sprawdzić, które zakłady
          realizują usługi najlepiej dopasowane do Twojego projektu.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/producenci?regions=wielkopolskie">
            <button className={styles.primaryBtn}>Producenci z Wielkopolskiego</button>
          </Link>
          <Link href="/wszyscy-producenci">
            <button className={styles.secondaryBtn}>Wszyscy Producenci</button>
          </Link>
        </div>
      </section>

      <section className={styles.textBlock}>
        <h2>Wielkopolska jako zaplecze stabilnej produkcji</h2>
        <p>
          Firmy EMS z Wielkopolski często łączą wysoką powtarzalność procesu z dobrą organizacją
          logistyki krajowej. To korzystne dla przedsiębiorstw, które potrzebują regularnych dostaw
          i przewidywalnych terminów przy zachowaniu stałej jakości montażu.
        </p>
        <p>
          Region jest atrakcyjny także dla projektów łączących prototypy z późniejszą produkcją
          seryjną, ponieważ wielu dostawców rozwija kompetencje od etapu NPI po pełne wdrożenie.
        </p>
      </section>

      <section className={styles.textBlock}>
        <h2>Checklist przed wyborem partnera</h2>
        <p>
          W pierwszej kolejności porównaj zakres usług dodatkowych: lakierowanie, montaż końcowy,
          pakowanie i wsparcie serwisowe. Takie elementy upraszczają łańcuch dostaw i redukują
          liczbę podwykonawców potrzebnych do realizacji produktu.
        </p>
        <p>
          Na etapie negocjacji warto omówić także KPI jakościowe, sposób raportowania postępu
          produkcji i plan eskalacji w razie ryzyk terminowych. To buduje przewidywalną współpracę
          zarówno przy krótkich, jak i długich seriach.
        </p>
      </section>
    </div>
  );
}
