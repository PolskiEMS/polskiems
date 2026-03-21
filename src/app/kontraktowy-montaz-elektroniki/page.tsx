import Link from "next/link";
import type { Metadata } from "next";
import styles from "../seo-page.module.css";

export const metadata: Metadata = {
  title: "Kontraktowy montaż elektroniki | PolskiEMS",
  description:
    "Szukasz partnera do kontraktowego montażu elektroniki? PolskiEMS pomaga znaleźć firmy EMS w Polsce oferujące produkcję kontraktową, montaż SMT, THT i PCB.",
};

export default function KontraktowyMontazElektronikiPage() {
  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px", color: "white" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>
        Kontraktowy montaż elektroniki
      </h1>

      <p style={{ fontSize: "1.15rem", lineHeight: 1.7, marginBottom: "22px" }}>
        Kontraktowy montaż elektroniki to model współpracy, w którym zewnętrzna
        firma przejmuje realizację produkcji urządzeń lub zespołów
        elektronicznych. PolskiEMS pomaga znaleźć producentów EMS w Polsce,
        którzy oferują takie usługi dla różnych branż i różnych skal zamówień.
      </p>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "22px" }}>
        W katalogu można znaleźć firmy specjalizujące się w montażu SMD, THT,
        produkcji PCB, testach funkcjonalnych, inspekcji, montażu obudowy oraz
        przygotowaniu produktu końcowego. To wygodne rozwiązanie dla firm,
        które chcą zlecić część lub całość procesu produkcyjnego.
      </p>

      <h2 style={{ fontSize: "2rem", margin: "34px 0 14px" }}>
        Dla kogo jest kontraktowy montaż elektroniki?
      </h2>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "18px" }}>
        Tego typu współpraca jest dobrym rozwiązaniem dla startupów, firm
        technologicznych, producentów urządzeń oraz przedsiębiorstw, które chcą
        skalować produkcję bez budowania własnego zaplecza montażowego.
        Pozwala to skrócić czas wdrożenia i korzystać z doświadczenia
        wyspecjalizowanego partnera.
      </p>

      <h2 style={{ fontSize: "2rem", margin: "34px 0 14px" }}>
        Na co zwrócić uwagę przy wyborze partnera?
      </h2>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "18px" }}>
        Przy wyborze firmy do kontraktowego montażu elektroniki warto sprawdzić
        zakres oferowanych usług, możliwości produkcyjne, doświadczenie w
        podobnych projektach, elastyczność obsługi oraz dostępne procesy
        kontroli jakości i testowania.
      </p>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "18px" }}>
        PolskiEMS ułatwia porównanie dostawców i szybkie dotarcie do firm,
        które odpowiadają wymaganiom projektu. Dzięki temu łatwiej znaleźć
        partnera do prototypów, małych serii i produkcji seryjnej.
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