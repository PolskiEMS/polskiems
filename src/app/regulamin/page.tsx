import Link from 'next/link';
import styles from './styles.module.css'

const Regulamin = () => {
    return (
        <div className={styles.page}>
            <h1>Regulamin</h1>
        <section>
        <h3>§1. Informacje ogólne</h3>
        <p>
          Niniejszy regulamin określa zasady korzystania ze strony internetowej
          polskiems.pl, prowadzonej przez Michała Kowalskiego.
        </p>
        <p>
          <strong>Kontakt:</strong><br />
          e-mail: info@polskiems.pl<br />
          tel.: 728 924 367
        </p>

        <p>
          Serwis ma charakter informacyjno-branżowy i prezentuje firmy działające
          w sektorze Electronic Manufacturing Services (EMS).
        </p>

        <p>
          Obecnie zgłoszenie firmy do katalogu jest bezpłatne.
        </p>
      </section>

      <section>
        <h3>§2. Warunki korzystania z serwisu</h3>
        <p>
          Strona nie wymaga rejestracji konta. Dodanie firmy do katalogu może
          nastąpić poprzez formularz kontaktowy lub na podstawie publicznie
          dostępnych danych.
        </p>
      </section>

      <section>
        <h3>§3. Publikacja danych firm</h3>
        <p>
          Dane firm prezentowane w katalogu mogą pochodzić z publicznie
          dostępnych źródeł, w szczególności ze stron internetowych firm,
          rejestrów publicznych (CEIDG, KRS) oraz innych ogólnodostępnych baz
          informacji gospodarczych.
        </p>

        <p>
          Nazwy firm, logotypy oraz inne oznaczenia mogą stanowić znaki towarowe
          odpowiednich podmiotów i są wykorzystywane wyłącznie w celach
          informacyjnych oraz identyfikacyjnych.
        </p>

        <p>
          Właściciel firmy może w każdym czasie zgłosić aktualizację danych,
          uzupełnienie profilu lub żądanie jego usunięcia poprzez kontakt z
          Administratorem.
        </p>
      </section>

      <section>
        <h3>§4. Zasady wyświetlania firm</h3>
        <p>
          Kolejność wyświetlania firm może zależeć od przyjętego systemu
          sortowania, daty dodania profilu, kryteriów wyszukiwania lub innych
          parametrów technicznych.
        </p>
      </section>

      <section>
        <h3>§5. Odpowiedzialność</h3>
        <p>
          Administrator dokłada należytej staranności w zakresie rzetelności
          prezentowanych informacji, jednak nie ponosi odpowiedzialności za ich
          aktualność ani kompletność.
        </p>
      </section>

      <section>
        <h3>§6. Dane i prywatność</h3>
        <p>
          Serwis może przetwarzać dane przekazane dobrowolnie przez użytkowników
          w formularzu kontaktowym wyłącznie w celu realizacji zapytania.
        </p>
      </section>

      <section>
        <h3>§7. Zmiany regulaminu</h3>
        <p>
          Administrator zastrzega sobie prawo do zmiany regulaminu. Aktualna
          wersja regulaminu publikowana jest na stronie internetowej.
        </p>
      </section>

      <section>
        <h3>§8. Postanowienia końcowe</h3>
        <p>
          W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają
          przepisy prawa polskiego.
        </p>
      </section>
            <Link href={'formularz_zgloszeniowy_firmy.docx'}>
                <button className={styles.chceZnalezcSie}>
                Chcę znaleźć się na stronie</button></Link>
        </div>
    );
}

export default Regulamin;
