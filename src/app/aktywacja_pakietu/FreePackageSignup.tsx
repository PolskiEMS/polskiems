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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSent(false);

    try {
      const res = await fetch('/api/packages/free-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          companyEmail: email,
          companyPhone: phone,
          companyWebsite: website,
          companyDescription: description,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie.');
        return;
      }

      setSent(true);
      setCompanyName('');
      setEmail('');
      setWebsite('');
      setPhone('');
      setDescription('');
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie za chwilę.');
    } finally {
      setSubmitting(false);
    }
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

        <button type="submit" className={styles.freeSubmitBtn} disabled={submitting}>
          {submitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie FREE'}
        </button>
      </form>

      {sent && (
        <p className={styles.success}>
          Dziękujemy! Zgłoszenie zostało zapisane i trafiło do panelu admin. Firma będzie aktywna po akceptacji.
        </p>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </section>
  );
}
