import Link from 'next/link';
import styles from './styles.module.css'

const Regulamin = () => {
    return (
        <div className={styles.page}>
            <h1>Regulamin</h1>
            <div>
                <h3>§1. Informacje ogólne</h3>
                <p>Niniejszy regulamin określa zasady korzystania ze strony internetowej polskiems.pl, prowadzonej przez: <br />
                    Michała Kowalskiego
                    <br />
                    <br />
                    Kontakt: info@polskiems.pl, <br />
                    tel. 734 860 876 <br />
                    Serwis oferuje możliwość zakupu miejsca promocyjnego na stronie internetowej dla firm działających w branży EMS.
                    Obecnie cennik nie obowiązuje – informacja o opłatach ma charakter orientacyjny i nie stanowi oferty handlowej.
                    Zgłoszenie firmy do katalogu jest darmowe i nie wymaga żadnej opłaty.</p>
                <h3>§2. Warunki korzystania z serwisu</h3>
                <p>Strona nie wymaga rejestracji konta. Aby dodać swoją firmę do bazy, należy wypełnić formularz kontaktowy, przesłać logo firmy i opłacić fakturę proforma zgodnie z aktualnym cennikiem. W przypadku pakietu Standard użytkownik raz w miesiącu otrzymuje raport PDF z ogólnymi statystykami wyszukiwań na stronie.</p>
                <h3>§3. Zasady wyświetlania firm</h3>
                <p>Kolejność wyświetlania firm na stronie zależy od unikalnego identyfikatora (ID), który przydzielany jest według kolejności dołączenia. W przy rezygnacji z obecności w serwisie i późniejszego powrotu – firma otrzymuje nowe ID i traci poprzednie miejsce w rankingu. Nie ma możliwości z wyższej pozycji ani dodatkowej promocji – zasady wyświetlania są jednakowe dla wszystkich.</p>
                <h3>§4. Odpowiedzialność użytkownika</h3>
                <p>Użytkownik ponosi pełną odpowiedzialność za treści, które przekazuje do umieszczenia na stronie (np. logo, opisy). Administrator zastrzega sobie prawo do odrzucenia materiałów naruszających prawo lub dobre obyczaje.</p>
                <h3>§5. Dane i prywatność</h3>
                <p>Serwis nie zbiera danych osobowych użytkowników. Przetwarzane są wyłącznie dane ogólnodostępne z publicznych rejestrów firm, niepodlegające pod RODO.</p>
                <h3>§6. Reklamy i promocje</h3>
                <p>Serwis nie umożliwia dodatkowego promowania ani reklamowania się poza oferowanymi pakietami. Każdy użytkownik ma równe szanse na widoczność w serwisie.</p>
                <h3>§7. Cennik i zwroty</h3>
                <p>Serwis oferuje dwa pakiety: Light – wyświetlanie firmy na stronie Standard – wyświetlanie + miesięczny raport PDF z ogólnymi statystykami wyszukiwań W przypadku rezygnacji z usługi przed końcem okresu rozliczeniowego, zwrot naliczany jest proporcjonalnie do niewykorzystanego czasu. (np. rezygnacja po 10 dniach z miesięcznego pakietu za 100 zł = wykorzystano 10/30 → 33,33 zł, zwrot: 100 zł – 33,33 zł = 66,67 zł) Zwroty są realizowane na konto podane przez użytkownika.</p>
                <h3>§8. Zmiany regulaminu</h3>
                <p>Administrator zastrzega sobie prawo do zmiany regulaminu. O wszelkich zmianach użytkownicy zostaną poinformowani drogą mailową.</p>
                <h3>§9. Postanowienia końcowe</h3>
                <p>W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa polskiego.</p>
            </div>
            <Link href={'formularz_zgloszeniowy_firmy.docx'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>
        </div>
    );
}

export default Regulamin;
