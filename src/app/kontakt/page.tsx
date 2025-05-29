import Link from 'next/link';
import styles from './styles.module.css'

const Kontakt = () => {
    return (
        <div className={styles.page}>
            <h1>Kontakt</h1>
            <h2>Chcesz się z nami skontaktować?<br />
                Jesteśmy do Twojej dyspozycji przez całą dobę!</h2>
            <p>Napisz do nas lub zadzwoń, a postaramy się odpowiedzieć w ciągu 24 godzin.</p>
            <div>
                <p><span>:</span></p>
                <p><span>E-mail:</span> info@polskiems.pl</p>
            </div>
            <div>
                <h3>Osoba kontaktowa:</h3>
                
                <p>Michał Kowalski – programista i założyciel</p>
            </div>
            <div>
                <p>Jeśli chcesz dowiedzieć się więcej o naszej firmie, napisz a odpowiemy na wszelkie pytania</p>
                <p>Zapraszamy do kontaktu – każda wiadomość jest dla nas ważna!</p>
                <p>Nie czekaj, napisz i przekonaj się, jak możemy Ci pomóc! <br />
                    Współpracując z nami, możecie liczyć na partnera, który bierze czynny udział w rozwoju Waszej działalności i dba o to, byście mieli realną przewagę na rynku.</p>
            </div>
            <Link href={'formularz_zgloszeniowy_firmy.docx'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>
        </div>
    );
}

export default Kontakt;
