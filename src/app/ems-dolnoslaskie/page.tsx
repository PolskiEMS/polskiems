import type { Metadata } from "next";
import Link from "next/link";
import styles from "../seo-page.module.css";

export const metadata: Metadata = {
  title: "EMS dolnośląskie | Firmy montażu elektroniki | PolskiEMS",
  description: "Poznaj firmy EMS z województwa dolnośląskiego. Znajdź producentów do prototypów, małych serii i produkcji elektroniki.",
};

export default function Page() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Firmy EMS w województwie dolnośląskim</h1>
        <p>
          Ta podstrona pomaga znaleźć producentów elektroniki działających w regionie Dolny Śląsk i Wrocław.
          W katalogu PolskiEMS możesz porównać profile firm i sprawdzić, które zakłady
          realizują usługi najlepiej dopasowane do Twojego projektu.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/producenci?regions=dolnośląskie">
            <button className={styles.primaryBtn}>Producenci z Dolnośląskiego</button>
          </Link>
          <Link href="/wszyscy-producenci">
            <button className={styles.secondaryBtn}>Wszyscy Producenci</button>
          </Link>
        </div>
      </section>

      <section className={styles.textBlock}>
        <h2>Dolny Śląsk: zaplecze technologiczne i inżynierskie</h2>
        <p>
          Region dolnośląski wyróżnia się dużą dostępnością kompetencji inżynierskich oraz
          rozwiniętym ekosystemem firm technologicznych. Dzięki temu łatwiej znaleźć partnera
          EMS, który wesprze zarówno montaż, jak i optymalizację projektu pod produkcję.
        </p>
        <p>
          Przy bardziej złożonych urządzeniach liczy się też jakość komunikacji między działami
          konstrukcyjnymi i produkcyjnymi. Bliskość geograficzna pomaga szybciej zamykać tematy
          dotyczące zmian materiałowych i aktualizacji dokumentacji.
        </p>
      </section>

      <section className={styles.textBlock}>
        <h2>Jak przygotować zapytanie do firm EMS?</h2>
        <p>
          Dobrze przygotowane zapytanie powinno zawierać BOM, pliki produkcyjne, oczekiwane testy,
          planowany wolumen i terminy. Im precyzyjniejsza specyfikacja, tym łatwiej otrzymać
          porównywalne oferty i realistyczne terminy realizacji.
        </p>
        <p>
          Warto również dopytać o dostępność alternatywnych komponentów, procedury zarządzania
          brakami materiałowymi oraz warunki współpracy przy zmianach projektu w trakcie produkcji.
        </p>
      </section>
    </div>
  );
}
