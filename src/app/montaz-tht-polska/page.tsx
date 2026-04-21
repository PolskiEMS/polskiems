import type { Metadata } from "next";
import Link from "next/link";
import AllProducers from "../components/AllProducers/AllProducers";
import styles from "../seo-page.module.css";

export const metadata: Metadata = {
  title: "Montaż THT w Polsce",
  description:
    "Znajdź firmy oferujące montaż THT w Polsce. Katalog producentów elektroniki i usług EMS.",
};

export default function MontazthtpolskaPage () {

return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Montaż THT w Polsce</h1>
        <p>
          Szukasz firmy realizującej montaż THT w Polsce? W katalogu PolskiEMS.pl
          znajdziesz producentów elektroniki, którzy oferują usługi w technologii THT
          i obsługują projekty o różnej skali.
        </p>

        <div className={styles.ctaRow}>
          <Link href="/producenci?requirements=Montaż+THT">
            <button className={styles.primaryBtn}>Wyszukaj producenta THT</button>
          </Link>
          <Link href="/wszyscy-producenci">
            <button className={styles.secondaryBtn}>Wszyscy producenci</button>
          </Link>
        </div>
      </section>

      <section className={styles.textBlock}>
        <h2>Kiedy warto wybrać montaż THT?</h2>
        <p>
          Technologia THT nadal ma duże znaczenie w wielu projektach elektronicznych,
          szczególnie tam, gdzie liczy się trwałość połączeń i specyficzne wymagania
          konstrukcyjne. Wybór odpowiedniego partnera produkcyjnego może znacząco
          wpłynąć na jakość i terminowość realizacji.
        </p>
      </section>

    </div>
  );
  
};