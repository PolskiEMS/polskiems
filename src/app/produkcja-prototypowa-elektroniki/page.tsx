import type { Metadata } from "next";
import Link from "next/link";
import styles from "../seo-page.module.css";

export const metadata: Metadata = {
  title: "Produkcja prototypowa elektroniki | PolskiEMS",
  description: "Produkcja prototypowa elektroniki w Polsce. Sprawdź, na co zwrócić uwagę przy wyborze partnera do szybkich iteracji i walidacji projektu.",
};

export default function Page() {
  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px", color: "white" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Produkcja prototypowa elektroniki</h1>

      <p style={{ fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "22px" }}>
        Produkcja prototypowa pozwala szybko zweryfikować założenia projektu i przygotować urządzenie do kolejnych etapów rozwoju. To ważny moment, w którym liczy się elastyczność i sprawna komunikacja z partnerem produkcyjnym.
      </p>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "18px" }}>
        Przy wyborze firmy do prototypów warto ocenić czas realizacji, możliwości DFM/DFT, dostęp do montażu SMT/THT oraz zaplecze testowe. Im szybciej otrzymasz wiarygodny feedback technologiczny, tym sprawniej przejdziesz do produkcji seryjnej.
      </p>

      <h2 style={{ fontSize: "2rem", margin: "34px 0 14px" }}>Na co zwrócić uwagę przed rozpoczęciem współpracy?</h2>
      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "18px" }}>
        Niezależnie od skali projektu warto omówić proces uruchomienia, dostępność materiałów,
        plan testów i sposób komunikacji zespołów. Jasne zasady na starcie pomagają uniknąć
        nieporozumień i usprawniają realizację kolejnych etapów produkcji.
      </p>

      <div className={styles.ctaRow}>
        <Link href="/wyszukaj">
          <button className={styles.primaryBtn}>Wyszukaj producenta</button>
        </Link>
        <Link href="/wszyscy-producenci">
          <button className={styles.secondaryBtn}>Wszyscy producenci</button>
        </Link>
      </div>
    </main>
  );
}
