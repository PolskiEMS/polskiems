import Link from 'next/link';
import styles from './styles.module.css'

const Onas = () => {
    return (
        <div className={styles.page}>
            <h1>O nas</h1>
            <p>
                Nasza firma powstała z potrzeby, którą zauważyliśmy podczas licznych spotkań z klientami z branży EMS. Wielu z nich nie miało odpowiedniego miejsca do promowania swoich usług i produktów. Postanowiliśmy to zmienić i stworzyć platformę, która daje równe szanse na promocję zarówno małym, jak i dużym firmom z branży EMS.
                Jesteśmy pierwszą firmą na rynku, która kompleksowo zajmuje się tworzeniem takiego miejsca – łatwo dostępnego i skutecznego. Nasza strona to nie tylko przestrzeń do prezentacji ofert, ale przede wszystkim narzędzie, które pozwala wyrównać szanse wszystkim uczestnikom rynku.
                Założycielami firmy są dwie osoby – programista i specjalista od zarządzania, którzy dbają o szybki i bezpośredni kontakt z klientami oraz błyskawiczną reakcję na ich potrzeby. Dzięki naszemu doświadczeniu w branży EMS dobrze rozumiemy specyfikę i wyzwania tego rynku, co pozwala nam tworzyć rozwiązania idealnie dopasowane do Waszych oczekiwań.
                Naszym celem jest nie tylko oferowanie miejsca na promocję, ale także aktywne wspieranie rozwoju Waszych firm. Dążymy do ciągłego rozbudowywania portalu oraz prowadzenia go jako platformy, która pomaga producentom skutecznie się reklamować i budować swoją markę.
                Współpracując z nami, możecie liczyć na partnera, który bierze czynny udział w rozwoju Waszej działalności i dba o to, byście mieli realną przewagę na rynku.
            </p>
            <Link href={'formularz_zgloszeniowy_firmy.docx'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>
        </div>
    );
}

export default Onas;