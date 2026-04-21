import type { Metadata } from "next";
import Link from "next/link";
import styles from "../seo-page.module.css";

export const metadata: Metadata = {
  title: "Jak wybrać firmę EMS? Praktyczny poradnik | PolskiEMS",
  description: "Dowiedz się, jak wybrać firmę EMS do produkcji elektroniki. Sprawdź kluczowe kryteria, które pomagają ograniczyć ryzyko i przyspieszyć wdrożenie.",
};

export default function Page() {
  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px", color: "white" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Jak wybrać firmę EMS do projektu?</h1>

      <p style={{ fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "22px" }}>
        Wybór partnera EMS ma bezpośredni wpływ na termin wdrożenia, jakość produktu i koszty produkcji. Dobrze przygotowany proces selekcji pozwala szybciej porównać oferty i ograniczyć ryzyko opóźnień.
      </p>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "18px" }}>
        Warto sprawdzić zakres usług, doświadczenie technologiczne, obsługiwane branże oraz standardy jakości. Znaczenie ma także transparentna wycena, sposób raportowania postępów i gotowość do obsługi zmian projektowych.
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
