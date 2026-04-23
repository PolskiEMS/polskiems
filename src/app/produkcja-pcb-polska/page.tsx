import type { Metadata } from "next";
import ServiceLandingPage from "../components/SeoPages/ServiceLandingPage";

export const metadata: Metadata = {
  title: "Produkcja PCB w Polsce | Producenci EMS | PolskiEMS",
  description:
    "Porównaj firmy oferujące produkcję PCB w Polsce. Sprawdź dostawców EMS, ich możliwości technologiczne i wybierz partnera do prototypów lub serii.",
};

export default function ProdukcjapcbpolskaPage() {
  return (
    <ServiceLandingPage
      title="Produkcja PCB w Polsce"
      lead="Produkcja płytek drukowanych PCB to kluczowy etap każdego projektu elektronicznego. Na tej stronie znajdziesz firmy, które dostarczają PCB i wspierają pełny proces wdrożenia – od prototypowania po produkcję seryjną oraz integrację z montażem EMS."
      searchHref="/producenci?requirements=Dostarcza%20PCB"
      heroImage={{
        src: "/images/uslugi/produkcja_pcb.png",
        alt: "Proces produkcji płytek PCB dla projektów elektronicznych",
      }}
      sections={[
        {
          heading: "Czym jest produkcja PCB i dlaczego jest tak ważna?",
          paragraphs: [
            "PCB to baza całego układu elektronicznego, która wpływa na niezawodność produktu, jakość montażu i stabilność działania urządzenia. Nawet dobrze zaprojektowana elektronika wymaga właściwie dobranej technologii wykonania płytek.",
            "Na etapie produkcji znaczenie mają m.in. tolerancje, jakość laminatu, kontrola procesu oraz zgodność z dokumentacją. To elementy, które bezpośrednio wpływają na czas uruchomienia i koszty dalszych etapów projektu.",
          ],
        },
        {
          heading: "Kiedy warto zlecić produkcję PCB wyspecjalizowanemu partnerowi?",
          paragraphs: [
            "Wsparcie doświadczonego dostawcy PCB jest szczególnie ważne w projektach wymagających szybkich iteracji prototypowych oraz przy przejściu do produkcji seryjnej. Pozwala to ograniczyć błędy technologiczne i skrócić czas wejścia produktu na rynek.",
            "Współpraca z partnerem, który rozumie potrzeby montażu SMT/THT, ułatwia spójne planowanie całego łańcucha dostaw. Dzięki temu można lepiej przewidywać terminy i stabilizować koszty produkcji.",
          ],
        },
        {
          heading: "Jak wybrać producenta PCB do projektu B2B?",
          paragraphs: [
            "Porównaj możliwości technologiczne, podejście do kontroli jakości, gotowość do konsultacji technicznych i standard obsługi zmian w dokumentacji. Z perspektywy biznesowej ważne są także terminy realizacji oraz komunikacja na etapie wdrożenia.",
            "Dobrą praktyką jest sprawdzenie, czy dostawca może współpracować z wybraną firmą montażową lub zapewnić usługę w modelu one-stop-shop. Taka organizacja procesu upraszcza zarządzanie projektem i redukuje ryzyko operacyjne.",
          ],
        },
      ]}
      cards={[
        {
          title: "Gdzie wykorzystuje się PCB",
          text: "W urządzeniach przemysłowych, elektronice użytkowej, systemach automatyki, telekomunikacji i produktach medycznych.",
        },
        {
          title: "Najważniejsze przewagi",
          text: "Lepsza powtarzalność jakości, większa przewidywalność dostaw i sprawniejsze przejście od prototypu do serii.",
        },
        {
          title: "Na co uważać",
          text: "Brak przejrzystej komunikacji, niedopasowanie technologii do projektu i niejasne zasady obsługi zmian inżynieryjnych.",
        },
      ]}
    />
  );
}
