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
          <Link href="/wyszukaj">
            <button className={styles.primaryBtn}>Wyszukaj producenta</button>
          </Link>
          <Link href="/wszyscy-producenci">
            <button className={styles.secondaryBtn}>Wszyscy producenci</button>
          </Link>
        </div>
      </section>

      <section className={styles.textBlock}>
        <h2>Jak wybierać partnera EMS lokalnie?</h2>
        <p>
          Współpraca z firmą z tego samego regionu może ułatwić logistykę, skrócić czas
          dostaw i przyspieszyć komunikację w trakcie wdrożenia. Warto sprawdzić możliwości
          montażu SMT i THT, doświadczenie w podobnych branżach oraz zaplecze testowe.
        </p>
        <p>
          Jeśli projekt wymaga elastyczności, dobrze zwrócić uwagę na obsługę prototypów,
          dostępność wsparcia inżynierskiego oraz gotowość do szybkiego skalowania produkcji.
          Dzięki temu łatwiej dopasować model współpracy do etapu rozwoju produktu.
        </p>
      </section>
    </div>
  );
}
