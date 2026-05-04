import type { Metadata } from "next";
import ServiceLandingPage from "../components/SeoPages/ServiceLandingPage";

export const metadata: Metadata = {
  title: "EMS w Polsce | Firmy produkcji elektroniki kontraktowej | PolskiEMS",
  description:
    "Szukasz firmy EMS w Polsce? Porównaj producentów elektroniki kontraktowej, ich usługi montażu SMT/THT, testy i możliwości skalowania produkcji.",
  alternates: {
    canonical: "https://polskiems.pl/ems-polska",
  },
};

export default function EmsPolskaPage() {
  return (
    <ServiceLandingPage
      title="EMS w Polsce"
      lead="PolskiEMS pomaga szybko znaleźć i porównać firmy EMS działające w Polsce. Sprawdź partnerów do produkcji kontraktowej elektroniki: od prototypowania i wdrożeń NPI po stabilną produkcję seryjną."
      searchHref="/producenci"
      heroImage={{
        src: "/images/uslugi/montaz_smt.png",
        alt: "Zakład EMS w Polsce realizujący produkcję elektroniki",
      }}
      sections={[
        {
          heading: "Czym jest EMS?",
          paragraphs: [
            "EMS (Electronics Manufacturing Services) to model współpracy, w którym wyspecjalizowany partner przejmuje wybrane etapy produkcji elektroniki: zakupy, montaż SMT/THT, testy, kontrolę jakości i logistykę.",
            "Dla firm B2B oznacza to szybsze wdrożenia, lepszą przewidywalność kosztów oraz możliwość skalowania produkcji bez rozbudowy własnego zaplecza.",
          ],
        },
        {
          heading: "Kiedy warto współpracować z firmą EMS?",
          paragraphs: [
            "Współpraca z EMS jest szczególnie korzystna, gdy projekt wymaga krótkiego time-to-market, regularnych serii produkcyjnych albo elastyczności w planowaniu wolumenów.",
            "Dobry partner EMS wspiera także etap przygotowania produkcji, walidacji procesu i optymalizacji BOM, co zmniejsza ryzyko błędów oraz przestojów.",
          ],
        },
        {
          heading: "Jak porównać firmy EMS w Polsce?",
          paragraphs: [
            "Warto zestawić doświadczenie branżowe, standardy jakości, możliwości testowe oraz dostępność wsparcia inżynieryjnego DFM/DFT.",
            "Równie ważne są terminy realizacji, komunikacja projektowa i przejrzystość procesu wyceny – szczególnie przy przejściu z prototypu do produkcji seryjnej.",
          ],
        },
      ]}
      cards={[
        {
          title: "Najczęstsze usługi",
          text: "Montaż SMT/THT, testy AOI i funkcjonalne, obsługa zakupów komponentów oraz wsparcie wdrożeń NPI.",
        },
        {
          title: "Korzyści dla B2B",
          text: "Skrócenie czasu wdrożenia, stabilna jakość produkcji i większa elastyczność operacyjna przy rosnących wolumenach.",
        },
        {
          title: "Jak zacząć",
          text: "Porównaj firmy w katalogu, a następnie wyślij zapytanie z dokumentacją projektu i wymaganym harmonogramem.",
        },
      ]}
    />
  );
}
