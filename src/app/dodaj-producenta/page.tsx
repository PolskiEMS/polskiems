import type { Metadata } from "next";
import Link from "next/link";
import PackageCheckout from "../cennik/PackageCheckout";
import { getAllDzialaniaEms, getAllProdukcjaScales, getAllRegion } from "@/lib/actions";
import styles from "./styles.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dodaj producenta EMS do katalogu | PolskiEMS",
  description:
    "Zgłoś firmę EMS lub producenta elektroniki do katalogu PolskiEMS. Wybierz pakiet, uzupełnij dane firmy, usługi i skalę produkcji.",
  alternates: {
    canonical: "https://polskiems.pl/dodaj-producenta",
  },
};

export default async function DodajProducentaPage() {
  const [dzialania, produkcja, regions] = await Promise.all([
    getAllDzialaniaEms(),
    getAllProdukcjaScales(),
    getAllRegion(),
  ]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Formularz zgłoszeniowy online</p>
        <h1>Dodaj firmę EMS do katalogu PolskiEMS</h1>
        <p className={styles.lead}>
          Uzupełnij dane producenta, wybierz pakiet i pokaż ofertę klientom szukającym montażu elektroniki,
          produkcji PCB, SMD, THT, prototypowania i usług EMS w Polsce.
        </p>

        <div className={styles.heroActions}>
          <a href="#formularz" className={styles.primaryAction}>Wypełnij formularz</a>
          <Link href="/cennik" className={styles.secondaryAction}>Porównaj pakiety</Link>
        </div>
      </section>

      <section className={styles.steps} aria-label="Jak działa zgłoszenie producenta">
        <article>
          <span>1</span>
          <h2>Wybierz pakiet</h2>
          <p>Free, Standard lub Premium — pakiet decyduje o zakresie widoczności i możliwościach profilu.</p>
        </article>
        <article>
          <span>2</span>
          <h2>Uzupełnij dane firmy</h2>
          <p>Podaj nazwę, kontakt, lokalizację, opis, usługi EMS oraz skalę produkcji.</p>
        </article>
        <article>
          <span>3</span>
          <h2>Wyślij zgłoszenie</h2>
          <p>Zgłoszenie trafia do systemu, a profil może zostać opublikowany lub aktywowany po potwierdzeniu pakietu.</p>
        </article>
      </section>

      <div id="formularz" className={styles.formAnchor}>
        <PackageCheckout
          initialPackage="free"
          regions={regions}
          dzialania={dzialania}
          produkcja={produkcja}
          producerSignupMode
        />
      </div>
    </div>
  );
}
