'use client';

import { FormEvent, useState } from 'react';
import styles from './styles.module.css';

export default function FreePackageSignup() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section className={styles.summaryCard}>
      <h2>Dodaj firmę w pakiecie FREE</h2>
      <p className={styles.muted}>
        Pakiet FREE nie wymaga płatności. Masz dwie opcje zgłoszenia firmy:
      </p>
      <ol className={styles.optionsList}>
        <li>wypełnij formularz online poniżej,</li>
        <li>albo pobierz formularz Word i wyślij go na adres <strong>info@polskiems.pl</strong>.</li>
      </ol>

      <div className={styles.wordOption}>
        <p className={styles.muted}>Opcja 2: Formularz zgłoszeniowy Word</p>
        <a href="/formularz_zgloszeniowy_firmy.docx" download className={styles.wordButton}>
          Pobierz formularz zgłoszeniowy (Word)
        </a>
        <p className={styles.mailHint}>
          Po wypełnieniu wyślij plik na adres:{' '}
          <a href="mailto:info@polskiems.pl" className={styles.backLink}>info@polskiems.pl</a>
        </p>
      </div>

      <p className={styles.muted}>Opcja 1: Formularz online</p>
      <form className={styles.freeForm} onSubmit={handleSubmit}>
        <label>
          Nazwa firmy
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </label>

        <label>
          Email kontaktowy
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Strona www
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
        </label>

        <label>
          Telefon
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>

        <label className={styles.fullWidth}>
          Krótki opis firmy
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </label>

        <button type="submit" className={styles.freeSubmitBtn}>Wyślij zgłoszenie FREE</button>
      </form>

      {sent && (
        <p className={styles.success}>
          Dziękujemy! Zgłoszenie z formularza online zostało wysłane.
        </p>
      )}
    </section>
  );
}
