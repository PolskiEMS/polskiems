import Link from 'next/link';
import styles from './styles.module.css'

const Regulamin = () => {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Regulamin</h1>

      <div className={styles.content}>
        <section>
          <h3>§1. Postanowienia ogólne</h3>
          <p>
            Niniejszy regulamin określa zasady korzystania z serwisu internetowego
            polskiems.pl, którego administratorem jest Michał Kowalski.
          </p>
          <p>
            <strong>Kontakt:</strong>
            <br />
            e-mail: info@polskiems.pl
            <br />
            tel.: +48 728 924 367
          </p>
          <p>
            Serwis ma charakter informacyjno-branżowy i służy prezentacji firm z
            sektora Electronic Manufacturing Services (EMS), a także umożliwia
            przesyłanie zapytań ofertowych do producentów.
          </p>
        </section>

        <section>
          <h3>§2. Zakres usług serwisu</h3>
          <p>
            Korzystanie z serwisu przez użytkowników wyszukujących firmy nie wymaga
            zakładania konta.
          </p>
          <p>
            Serwis umożliwia w szczególności: przeglądanie katalogu firm,
            wyszukiwanie producentów według kryteriów, przejście do danych
            kontaktowych firm oraz przesłanie zapytania ofertowego.
          </p>
          <p>
            Zgłoszenie firmy do katalogu może nastąpić przez kontakt z
            Administratorem lub przez przekazanie formularza zgłoszeniowego.
          </p>
        </section>

        <section>
          <h3>§3. Zasady publikacji i aktualizacji profili firm</h3>
          <p>
            Dane prezentowane w katalogu mogą pochodzić od samych firm lub z
            publicznie dostępnych źródeł (np. strony WWW firm, CEIDG, KRS).
          </p>
          <p>
            Administrator dokłada należytej staranności, aby publikowane dane były
            rzetelne, jednak nie gwarantuje ich pełnej aktualności i kompletności.
          </p>
          <p>
            Firma ma prawo w dowolnym momencie zgłosić sprostowanie, uzupełnienie
            albo usunięcie swojego profilu, kontaktując się z Administratorem.
          </p>
        </section>

        <section>
          <h3>§4. Pakiety i widoczność firm</h3>
          <p>
            Serwis może oferować różne pakiety obecności firmy (w tym bezpłatne i
            płatne), które wpływają na zakres widoczności profilu i dodatkowe
            funkcje promocyjne.
          </p>
          <p>
            Kolejność prezentacji firm może zależeć m.in. od rodzaju pakietu,
            oznaczeń promocyjnych, kryteriów filtrowania, kompletności profilu oraz
            parametrów technicznych systemu.
          </p>
          <p>
            Szczegółowe warunki pakietów, w tym cena i okres obowiązywania, są
            wskazywane w serwisie przed aktywacją wybranej opcji.
          </p>
        </section>

        <section>
          <h3>§5. Zasady korzystania przez użytkowników</h3>
          <p>
            Użytkownik zobowiązuje się korzystać z serwisu zgodnie z prawem,
            dobrymi obyczajami i niniejszym regulaminem.
          </p>
          <p>
            Zabronione jest dostarczanie treści bezprawnych, podejmowanie prób
            zakłócania pracy serwisu, nadużywanie formularzy kontaktowych oraz
            automatyczne pozyskiwanie danych w sposób naruszający interes
            Administratora lub firm prezentowanych w katalogu.
          </p>
        </section>

        <section>
          <h3>§6. Dane osobowe, pliki cookies i statystyki</h3>
          <p>
            Administrator przetwarza dane osobowe zgodnie z obowiązującymi
            przepisami prawa, w szczególności RODO.
          </p>
          <p>
            Dane przekazane przez formularze (np. dane kontaktowe i treść zapytania)
            są przetwarzane wyłącznie w celu obsługi zgłoszenia i kontaktu z
            użytkownikiem lub firmą.
          </p>
          <p>
            Serwis może wykorzystywać pliki cookies oraz narzędzia statystyczne do
            celów analitycznych, bezpieczeństwa i poprawy jakości usług, w tym do
            pomiaru wyświetleń stron i interakcji użytkowników.
          </p>
        </section>

        <section>
          <h3>§7. Odpowiedzialność</h3>
          <p>
            Administrator nie odpowiada za decyzje biznesowe podejmowane na
            podstawie informacji dostępnych w katalogu ani za działania podmiotów
            trzecich, do których odnośniki znajdują się w serwisie.
          </p>
          <p>
            Administrator zastrzega możliwość czasowej niedostępności serwisu, w
            szczególności z przyczyn technicznych, serwisowych lub związanych z
            bezpieczeństwem.
          </p>
        </section>

        <section>
          <h3>§8. Zmiany regulaminu i postanowienia końcowe</h3>
          <p>
            Administrator może aktualizować regulamin, publikując nową wersję na
            stronie. Zmiany obowiązują od dnia wskazanego przy nowej wersji
            regulaminu.
          </p>
          <p>
            W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego.
          </p>
        </section>

        <Link href={"/api/formularz-v2"}>
          <button className={styles.chceZnalezcSie}>
            Chcę znaleźć się na stronie
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Regulamin;
