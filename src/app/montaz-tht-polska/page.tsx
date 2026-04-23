import type { Metadata } from "next";
import ServiceLandingPage from "../components/SeoPages/ServiceLandingPage";

export const metadata: Metadata = {
  title: "Montaż THT w Polsce | Producenci elektroniki | PolskiEMS",
  description:
    "Szukasz montażu THT w Polsce? Sprawdź producentów EMS, porównaj kompetencje technologiczne i wybierz partnera do projektów wymagających trwałych połączeń.",
};

export default function MontazthtpolskaPage() {
  return (
    <ServiceLandingPage
      title="Montaż THT w Polsce"
      lead="Montaż przewlekany THT jest wybierany tam, gdzie liczy się wytrzymałość mechaniczna, stabilność połączeń i niezawodność pracy urządzenia w wymagających warunkach. Na tej stronie porównasz firmy EMS oferujące montaż THT, wsparcie jakościowe oraz obsługę projektów od prototypu po produkcję seryjną."
      searchHref="/producenci?requirements=Monta%C5%BC%20THT"
      heroImage={{
        src: "/images/uslugi/montaz-tht.png",
        alt: "Stanowisko do montażu THT w zakładzie produkcji elektroniki",
      }}
      sections={[
        {
          heading: "Czym jest montaż THT i kiedy warto go wybrać?",
          paragraphs: [
            "Montaż THT polega na osadzaniu wyprowadzeń elementów elektronicznych w otworach płytki PCB. Dzięki temu uzyskuje się solidne połączenia, które dobrze znoszą obciążenia mechaniczne, drgania oraz częste zmiany temperatury.",
            "Technologia THT jest często stosowana w elektronice przemysłowej, automatyce, energetyce i urządzeniach o podwyższonej trwałości. W wielu projektach THT uzupełnia montaż SMT, gdy trzeba zastosować większe komponenty lub elementy mocy.",
          ],
        },
        {
          heading: "Najważniejsze zalety technologii THT",
          paragraphs: [
            "Kluczową zaletą THT jest duża odporność połączeń lutowanych na naprężenia eksploatacyjne. To ważne w urządzeniach pracujących w trudnym środowisku i przy długim cyklu życia produktu.",
            "THT daje też większą elastyczność przy montażu wybranych elementów specjalnych, takich jak złącza, transformatory czy komponenty o większej masie. W praktyce pozwala to lepiej dopasować proces do wymagań konkretnej aplikacji.",
          ],
        },
        {
          heading: "Na co zwrócić uwagę przy wyborze producenta THT?",
          paragraphs: [
            "Warto sprawdzić doświadczenie dostawcy w podobnych realizacjach, standard kontroli jakości oraz to, jak wygląda dokumentowanie procesu i testów. Duże znaczenie ma również gotowość do obsługi zmian inżynieryjnych podczas wdrożenia.",
            "Dobrze, gdy partner EMS oferuje także integrację z montażem SMT, testami funkcjonalnymi i logistyką. Taka współpraca zwykle skraca czas realizacji oraz upraszcza komunikację między zespołami projektowymi.",
          ],
        },
      ]}
      cards={[
        {
          title: "Typowe zastosowania",
          text: "Sterowniki przemysłowe, moduły zasilania, elektronika energetyczna i urządzenia pracujące w środowiskach o podwyższonych wymaganiach.",
        },
        {
          title: "Kiedy THT daje przewagę",
          text: "Gdy projekt wymaga wysokiej trwałości połączeń, elementów przewlekanych lub stabilnej pracy przy wibracjach i obciążeniach.",
        },
        {
          title: "Co porównać w ofertach",
          text: "Możliwości technologiczne, jakość procesu, terminy dostaw, elastyczność przy seriach i gotowość do wspólnego planowania produkcji.",
        },
      ]}
    />
  );
}
