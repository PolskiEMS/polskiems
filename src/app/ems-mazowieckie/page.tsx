import type { Metadata } from "next";
import Link from "next/link";
import styles from "../seo-page.module.css";

export const metadata: Metadata = {
  title: "EMS mazowieckie | Firmy montażu elektroniki | PolskiEMS",
  description: "Szukasz partnera EMS w województwie mazowieckim? Sprawdź firmy z regionu mazowieckiego oferujące montaż elektroniki, SMT, THT i produkcję kontraktową.",
};

export default function Page() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>Firmy EMS w województwie mazowieckim</h1>
        <p>
          Ta podstrona pomaga znaleźć producentów elektroniki działających w regionie Mazowsze i Warszawa.
          W katalogu PolskiEMS możesz porównać profile firm i sprawdzić, które zakłady
          realizują usługi najlepiej dopasowane do Twojego projektu.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/producenci?regions=mazowieckie">
            <button className={styles.primaryBtn}>Producenci z Mazowieckiego</button>
          </Link>
          <Link href="/wszyscy-producenci">
            <button className={styles.secondaryBtn}>Wszyscy Producenci</button>
          </Link>
        </div>
      </section>

      <section className={styles.textBlock}>
        <h2>Dlaczego Mazowsze jest mocnym regionem dla EMS?</h2>
        <p>
          W województwie mazowieckim działa wiele firm łączących montaż SMT i THT z usługami
          NPI, testami funkcjonalnymi oraz wsparciem zakupowym. Bliskość Warszawy ułatwia
          koordynację projektów dla branż o wysokich wymaganiach jakościowych.
        </p>
        <p>
          Zlecając produkcję lokalnie, łatwiej zaplanować spotkania techniczne, audyty procesu
          i szybkie iteracje prototypów. To ważne szczególnie przy wdrożeniach, gdzie liczy się
          krótki czas od projektu do gotowego wyrobu.
        </p>
      </section>

      <section className={styles.textBlock}>
        <h2>Jak porównać firmy EMS w regionie?</h2>
        <p>
          Zwróć uwagę na realne moce produkcyjne, poziom automatyzacji linii oraz zakres testów
          AOI, ICT i FCT. Warto też sprawdzić doświadczenie dostawcy w podobnych urządzeniach,
          np. elektronice przemysłowej, IoT lub systemach zasilania.
        </p>
        <p>
          Przed wyborem partnera dobrze omówić proces onboardingowy: wyceny BOM, zasady zmian
          inżynierskich (ECO), organizację logistyki i politykę utrzymania zapasu komponentów.
        </p>
      </section>
    </div>
  );
}
