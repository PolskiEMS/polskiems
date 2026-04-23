import type { Metadata } from "next";
import styles from "../seo-page.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Produkcja PCB w Polsce | Producenci EMS | PolskiEMS",
  description:
    "Porównaj firmy oferujące produkcję PCB w Polsce. Sprawdź dostawców EMS, ich możliwości technologiczne i wybierz partnera do prototypów lub serii.",
};

export default function ProdukcjapcbpolskaPage() {

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Produkcja PCB w Polsce</h1>
        <p>
          Szukasz firmy oferującej produkcję PCB lub kompleksowe usługi EMS w Polsce?
          Na tej stronie znajdziesz producentów elektroniki, którzy deklarują
          możliwość dostarczenia PCB i obsługi projektów produkcyjnych.
        </p>

        <div className={styles.ctaRow}>
          <Link href="/producenci?requirements=Dostarcza+PCB">
            <button className={styles.primaryBtn}>Wyszukaj producenta PCB</button>
          </Link>
          <Link href="/wszyscy-producenci">
            <button className={styles.secondaryBtn}>Wszyscy producenci</button>
          </Link>
        </div>
      </section>

      <section className={styles.textBlock}>
        <h2>Jak wybrać producenta PCB?</h2>
        <p>
          Przy wyborze partnera warto zwrócić uwagę na zakres usług, doświadczenie,
          możliwość realizacji prototypów i większych serii oraz dopasowanie do
          wymagań projektu. W przypadku bardziej złożonych realizacji istotne są też
          testy, montaż i obsługa całego procesu produkcji elektroniki.
        </p>
        <p>
          PolskiEMS.pl pomaga szybciej znaleźć odpowiednie firmy działające na rynku
          EMS w Polsce i porównać dostępnych producentów według kategorii oraz
          możliwości produkcyjnych.
        </p>
      </section>
    </div>
  );
}
