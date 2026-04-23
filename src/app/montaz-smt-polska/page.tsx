import type { Metadata } from "next";
import styles from "../seo-page.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Montaż SMT w Polsce | Firmy EMS | PolskiEMS",
  description:
    "Znajdź firmy realizujące montaż SMT w Polsce. Porównaj partnerów EMS pod kątem jakości, terminów i dopasowania do skali Twojego projektu.",
};

export default function MontazsmtpolskaPage() {

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Montaż SMT w Polsce</h1>
        <p>
          Na tej stronie znajdziesz firmy oferujące montaż SMT w Polsce. Jeśli
          szukasz partnera do produkcji elektroniki, prototypów lub większych serii,
          możesz szybko przejrzeć producentów działających w branży EMS.
        </p>

        <div className={styles.ctaRow}>
          <Link href="/producenci?requirements=Montaż+SMT">
            <button className={styles.primaryBtn}>Wyszukaj producenta SMT</button>
          </Link>
          <Link href="/wszyscy-producenci">
            <button className={styles.secondaryBtn}>Wszyscy producenci</button>
          </Link>
        </div>
      </section>

      <section className={styles.textBlock}>
        <h2>Dlaczego montaż SMT jest ważny?</h2>
        <p>
          Montaż SMT jest jedną z najczęściej wykorzystywanych technologii w
          nowoczesnej produkcji elektroniki. Pozwala realizować zarówno małe serie,
          jak i duże wolumeny, przy zachowaniu wysokiej powtarzalności i jakości.
        </p>
        <p>
          W katalogu PolskiEMS.pl możesz porównać firmy, które deklarują montaż SMT,
          a następnie skontaktować się z wybranym producentem elektroniki.
        </p>
      </section>

    </div>
  );
}
