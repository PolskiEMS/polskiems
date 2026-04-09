'use client';

import { useMemo, useState } from 'react';
import styles from './styles.module.css';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type PaidPackage = 'standard' | 'premium';
type Provider = 'stripe' | 'przelewy24';

const PACKAGE_PRICE: Record<PaidPackage, number> = {
  standard: 199,
  premium: 299,
};

export default function PackageCheckout() {
  const searchParams = useSearchParams();
  const packageFromQuery = searchParams.get('pakiet');

  const [selectedPackage, setSelectedPackage] = useState<PaidPackage>(
    packageFromQuery === 'premium' ? 'premium' : 'standard'
  );
  const [provider, setProvider] = useState<Provider>('stripe');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const total = useMemo(() => PACKAGE_PRICE[selectedPackage], [selectedPackage]);

  async function handleCheckout() {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/packages/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          companyEmail,
          companyPhone,
          companyDescription,
          packageType: selectedPackage,
          provider,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || 'Nie udało się utworzyć płatności');
        if (data?.code === 'COMPANY_EXISTS') {
          setMessage('Możesz użyć formularza zgłoszeniowego i uzupełnić więcej danych.');
        }
        return;
      }

      setOrderId(data.orderId);
      setMessage(`Utworzono zamówienie #${data.orderId} dla ${data.companyName}.`);
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmPayment() {
    if (!orderId) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/packages/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || 'Nie udało się potwierdzić płatności');
        return;
      }

      setMessage(
        data.alreadyPaid
          ? 'To zamówienie było już opłacone.'
          : `Płatność potwierdzona. Pakiet ${String(data.activatedPackage).toUpperCase()} aktywowany.`
      );
    } catch {
      setError('Błąd połączenia przy aktywacji pakietu.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className={styles.checkoutSection}>
      <h3>Wybór pakietu i aktywacja</h3>
      <p id="checkout" className={styles.checkoutHint}>
        Wypełnij podstawowe dane firmy, wybierz pakiet i operatora płatności, a po opłaceniu pakiet zostanie aktywowany.
      </p>
      <p className={styles.checkoutHint}>
        Jeśli firma już istnieje, system pokaże komunikat i poprosi o uzupełnienie danych przez formularz zgłoszeniowy.
        {" "}
        <Link href="/formularz_zgloszeniowy_firmy.docx" className={styles.inlineLink}>Pobierz formularz</Link>
      </p>

      <div className={styles.checkoutGrid}>
        <label className={styles.field}>
          <span>Pakiet</span>
          <select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value as PaidPackage)}>
            <option value="standard">STANDARD — 399 zł / mies.</option>
            <option value="premium">PREMIUM — 999 zł / mies.</option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Operator płatności</span>
          <select value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
            <option value="stripe">Stripe</option>
            <option value="przelewy24">Przelewy24</option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Nazwa firmy</span>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="np. Techbit"
          />
        </label>

        <label className={styles.field}>
          <span>Email firmy</span>
          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder="biuro@firma.pl"
          />
        </label>

        <label className={styles.field}>
          <span>Telefon (opcjonalnie)</span>
          <input
            type="text"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            placeholder="+48 ..."
          />
        </label>

        <label className={styles.fieldWide}>
          <span>Krótki opis firmy (opcjonalnie)</span>
          <input
            type="text"
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            placeholder="Montaż SMT/THT, testy, conformal coating..."
          />
        </label>
      </div>

      <div className={styles.checkoutSummary}>Do zapłaty: <strong>{total} zł brutto</strong></div>

      <div className={styles.checkoutActions}>
        <button type="button" onClick={handleCheckout} disabled={isLoading}>
          {isLoading ? 'Przetwarzanie...' : 'Utwórz płatność'}
        </button>

        <button
          type="button"
          onClick={handleConfirmPayment}
          disabled={isLoading || !orderId}
          className={styles.confirmBtn}
        >
          {isLoading ? 'Przetwarzanie...' : 'Potwierdź płatność i aktywuj'}
        </button>
      </div>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </section>
  );
}
