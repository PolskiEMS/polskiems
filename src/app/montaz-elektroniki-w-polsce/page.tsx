import type { Metadata } from "next";
import Link from "next/link";
import styles from "../seo-page.module.css";

export const metadata: Metadata = {
  title: "Montaż elektroniki w Polsce | PolskiEMS",
  description:
    "Znajdź firmy oferujące montaż elektroniki w Polsce. PolskiEMS pomaga wyszukać producentów EMS, montaż SMT, THT, PCB oraz usługi produkcji kontraktowej.",
};

export default function MontazElektronikiPolskaPage() {
  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px", color: "white" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>
        Montaż elektroniki w Polsce
      </h1>

      <p style={{ fontSize: "1.15rem", lineHeight: 1.7, marginBottom: "22px" }}>
        PolskiEMS to katalog firm oferujących montaż elektroniki w Polsce.
        Strona pomaga szybko znaleźć producentów EMS oraz partnerów do
        produkcji kontraktowej, prototypów, małych serii i większych wdrożeń.
      </p>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "22px" }}>
        W bazie znajdują się firmy oferujące między innymi montaż SMD, montaż
        THT, montaż PCB, montaż produktu finalnego, testy funkcjonalne oraz
        dodatkowe usługi związane z produkcją elektroniki. Dzięki filtrom można
        wyszukiwać producentów według województwa, zakresu usług oraz skali
        produkcji.
      </p>

      <h2 style={{ fontSize: "2rem", margin: "34px 0 14px" }}>
        Jak wybrać firmę do montażu elektroniki?
      </h2>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "18px" }}>
        Przy wyborze partnera warto zwrócić uwagę na zakres obsługiwanych
        technologii, doświadczenie produkcyjne, możliwości testowe oraz skalę
        realizowanych projektów. Dla jednych klientów ważna będzie szybka
        obsługa prototypów, dla innych stabilna produkcja seryjna i szerszy
        zakres usług dodatkowych.
      </p>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "18px" }}>
        PolskiEMS ułatwia porównanie firm i szybsze znalezienie producenta,
        który odpowiada potrzebom projektu. To dobre miejsce zarówno dla firm
        szukających partnera do pierwszego wdrożenia, jak i dla klientów
        potrzebujących dostawcy do regularnej produkcji elektroniki.
      </p>

      <h2 style={{ fontSize: "2rem", margin: "34px 0 14px" }}>
        Jakie usługi obejmuje montaż elektroniki?
      </h2>

      <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "18px" }}>
        Montaż elektroniki może obejmować przygotowanie produkcji, montaż SMD i
        THT, dostarczanie PCB, zakup komponentów, inspekcję, testy, montaż
        obudowy oraz przygotowanie gotowego produktu finalnego. Zakres zależy od
        konkretnej firmy i profilu realizowanych zamówień.
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