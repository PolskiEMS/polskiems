import type { Metadata } from "next";
import Link from "next/link";
import styles from "../seo-page.module.css";

export const metadata: Metadata = {
  title: "EMS śląskie | Firmy montażu elektroniki | PolskiEMS",
  description: "Przegląd firm EMS z województwa śląskiego. Wyszukaj partnerów do montażu elektroniki, SMT, THT i usług produkcyjnych.",
};

export default function Page() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Firmy EMS w województwie śląskim</h1>
        <p>
          Ta podstrona pomaga znaleźć producentów elektroniki działających w regionie Śląsk.
          W katalogu PolskiEMS możesz porównać profile firm i sprawdzić, które zakłady
          realizują usługi najlepiej dopasowane do Twojego projektu.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/producenci?regions=śląskie">
            <button className={styles.primaryBtn}>Producenci ze Śląskiego</button>
          </Link>
          <Link href="/wszyscy-producenci">
            <button className={styles.secondaryBtn}>Wszyscy Producenci</button>
          </Link>
        </div>
      </section>

      <section className={styles.textBlock}>
        <h2>Śląsk i elektronika przemysłowa</h2>
        <p>
          Województwo śląskie to silny ośrodek produkcyjny, dlatego firmy EMS z regionu często
          realizują projekty dla automatyki, energetyki i urządzeń przemysłowych. Często oznacza
          to dobrą znajomość rygorystycznych norm jakości oraz wymagań dokumentacyjnych.
        </p>
        <p>
          Dla zespołów R&D ważna jest możliwość szybkiego kontaktu z działem inżynierskim,
          konsultacji DFM i sprawnego przejścia z prototypu do serii. Lokalny partner upraszcza
          cały proces i ogranicza ryzyko opóźnień.
        </p>
      </section>

      <section className={styles.textBlock}>
        <h2>Ocena dostawcy: praktyczne kryteria</h2>
        <p>
          Sprawdź, jak wygląda kontrola jakości wejściowej komponentów, identyfikowalność partii
          oraz standardy ESD na hali. To elementy, które realnie wpływają na stabilność procesu
          i powtarzalność parametrów gotowej elektroniki.
        </p>
        <p>
          Dodatkowym atutem jest doświadczenie firmy w obsłudze serii mieszanych: od krótkich
          partii pilotażowych po większe zamówienia produkcyjne z planowanym harmonogramem dostaw.
        </p>
      </section>
    </div>
  );
}
