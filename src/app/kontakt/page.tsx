import Link from 'next/link';
import styles from './styles.module.css'

const Kontakt = () => {
  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <h1>Kontakt</h1>
        <p className={styles.lead}>
          Chcesz porozmawiać o współpracy, dodaniu firmy do katalogu lub płatnym pakiecie?
          Napisz do nas — odpowiadamy maksymalnie w ciągu 24 godzin roboczych.
        </p>
      </header>

      <div className={styles.contactGrid}>
        <article className={styles.card}>
          <h2>Dane kontaktowe</h2>
          <ul className={styles.contactList}>
            <li>
              <span>E-mail</span>
              <a href="mailto:info@polskiems.pl">info@polskiems.pl</a>
            </li>
            <li>
              <span>Telefon</span>
              <a href="tel:+48733811482">+48 733 811 482</a>
            </li>
            <li>
              <span>Czas odpowiedzi</span>
              <p>Do 24h w dni robocze</p>
            </li>
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Osoba kontaktowa</h2>
          <p className={styles.personName}>Michał Kowalski</p>
          <p className={styles.personRole}>Założyciel PolskiEMS</p>
          <p className={styles.personNote}>
            Pomożemy dobrać odpowiedni pakiet, zweryfikować profil firmy i zaplanować dalsze kroki publikacji.
          </p>
        </article>
      </div>

      <article className={styles.infoBox}>
        <h3>Jak możemy pomóc?</h3>
        <p>
          Wspieramy firmy produkcyjne i usługowe w zwiększaniu widoczności w branży EMS.
          Każde zapytanie traktujemy priorytetowo — od pierwszego kontaktu po pełne uruchomienie profilu.
        </p>
      </article>

      <div className={styles.actions}>
        <a href="mailto:info@polskiems.pl" className={styles.primaryBtn}>Napisz e-mail</a>
        <Link href="/formularz_zgloszeniowy_firmy.docx" className={styles.secondaryBtn}>Pobierz formularz zgłoszeniowy</Link>
      </div>
    </section>
  );
}

export default Kontakt;
