import type { Metadata } from "next";
import Link from "next/link";
import styles from "../seo-page.module.css";

export const metadata: Metadata = {
  title: "EMS pomorskie | Firmy montażu elektroniki | PolskiEMS",
  description: "Znajdź producentów EMS w województwie pomorskim. Porównaj firmy oferujące montaż elektroniki, prototypy i produkcję seryjną.",
};

export default function Page() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Firmy EMS w województwie pomorskim</h1>
        <p>
          Ta podstrona pomaga znaleźć producentów elektroniki działających w regionie Trójmiasto i Pomorze.
          W katalogu PolskiEMS możesz porównać profile firm i sprawdzić, które zakłady
          realizują usługi najlepiej dopasowane do Twojego projektu.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/producenci?regions=pomorskie">
            <button className={styles.primaryBtn}>Producenci z Pomorskiego</button>
          </Link>
          <Link href="/wszyscy-producenci">
            <button className={styles.secondaryBtn}>Wszyscy Producenci</button>
          </Link>
        </div>
      </section>

      <section className={styles.textBlock}>
        <h2>EMS na Pomorzu: produkcja dla firm krajowych i eksportowych</h2>
        <p>
          Pomorskie to region, w którym wiele firm rozwija elektronikę dla automatyki,
          telekomunikacji i systemów morskich. Dostawcy EMS oferują tu zarówno szybkie
          prototypowanie, jak i stabilną produkcję seryjną.
        </p>
        <p>
          Dostęp do portów oraz zaplecza logistycznego Trójmiasta pomaga organizować dostawy
          komponentów i wysyłki gotowych urządzeń. To istotna przewaga przy projektach o
          międzynarodowym łańcuchu dostaw.
        </p>
      </section>

      <section className={styles.textBlock}>
        <h2>Na co zwrócić uwagę przy wyborze partnera w regionie?</h2>
        <p>
          Oprócz ceny warto analizować transparentność procesu: terminy realizacji, komunikację
          statusów produkcji i sposób raportowania jakości. Dobrą praktyką jest też weryfikacja,
          jak firma obsługuje reklamacje i działania korygujące.
        </p>
        <p>
          Jeśli planujesz skalowanie wolumenu, sprawdź dostępność dodatkowych zmian produkcyjnych,
          elastyczność harmonogramu oraz możliwość utrzymania tych samych standardów jakości przy
          większej liczbie zleceń.
        </p>
      </section>
    </div>
  );
}
