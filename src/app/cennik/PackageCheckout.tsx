"use client";

import { useMemo, useState } from "react";
import styles from "./styles.module.css";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FreePackageSignup from "../aktywacja_pakietu/FreePackageSignup";

type PaidPackage = "standard" | "premium";
type PackageType = "free" | PaidPackage;
type Provider = "stripe" | "przelewy24";
type BillingCycleMonths = 1 | 3 | 6 | 12;

const PACKAGE_PRICE_TOTAL: Record<PaidPackage, Record<BillingCycleMonths, number>> = {
  standard: {
    1: 199,
    3: 549,
    6: 999,
    12: 1799,
  },
  premium: {
    1: 299,
    3: 849,
    6: 1599,
    12: 2999,
  },
};

type PackageCheckoutProps = {
  initialPackage?: PackageType;
};

export default function PackageCheckout({
  initialPackage = "standard",
}: PackageCheckoutProps) {
  const searchParams = useSearchParams();
  const packageFromQuery = searchParams.get("pakiet");

  const resolvedPackage: PackageType =
    packageFromQuery === "premium"
      ? "premium"
      : packageFromQuery === "free"
        ? "free"
        : initialPackage;

  if (resolvedPackage === "free") {
    return <FreePackageSignup />;
  }

  const [selectedPackage, setSelectedPackage] = useState<PaidPackage>(
    resolvedPackage === "premium" ? "premium" : "standard"
  );
  const [provider, setProvider] = useState<Provider>("stripe");
  const [billingCycleMonths, setBillingCycleMonths] = useState<BillingCycleMonths>(1);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerCompanyName, setBuyerCompanyName] = useState("");
  const [buyerTaxId, setBuyerTaxId] = useState("");
  const [buyerAddressLine1, setBuyerAddressLine1] = useState("");
  const [buyerPostalCode, setBuyerPostalCode] = useState("");
  const [buyerCity, setBuyerCity] = useState("");
  const [buyerCountry, setBuyerCountry] = useState("Polska");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const total = useMemo(
    () => PACKAGE_PRICE_TOTAL[selectedPackage][billingCycleMonths],
    [selectedPackage, billingCycleMonths]
  );

  const monthlyAverage = useMemo(
    () => Math.round((total / billingCycleMonths) * 100) / 100,
    [total, billingCycleMonths]
  );

  async function handleCheckout() {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/packages/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyEmail,
          companyPhone,
          companyDescription,
          buyerName,
          buyerEmail,
          buyerPhone,
          buyerCompanyName,
          buyerTaxId,
          buyerAddressLine1,
          buyerPostalCode,
          buyerCity,
          buyerCountry,
          billingCycleMonths,
          packageType: selectedPackage,
          provider,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data?.error || "Nie udało się utworzyć płatności");
        if (data?.code === "COMPANY_EXISTS") {
          setMessage(
            "Możesz użyć formularza zgłoszeniowego i uzupełnić więcej danych."
          );
        }
        return;
      }

      setOrderId(data.orderId);
      setMessage(
        `Utworzono zamówienie #${data.orderId} dla ${data.companyName} (${billingCycleMonths} mies.).`
      );
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmPayment() {
    if (!orderId) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/packages/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data?.error || "Nie udało się potwierdzić płatności");
        return;
      }

      setMessage(
        data.alreadyPaid
          ? "To zamówienie było już opłacone."
          : `Płatność potwierdzona. Pakiet ${String(data.activatedPackage).toUpperCase()} aktywowany na ${String(data.billingCycleMonths)} mies. (ważny do ${String(data.packageValidUntil)}).`
      );
    } catch {
      setError("Błąd połączenia przy aktywacji pakietu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className={styles.checkoutSection}>
      <h3>Dane aktywacji</h3>

      <p id="checkout" className={styles.checkoutHint}>
        Uzupełnij dane firmy, wybierz metodę płatności i aktywuj pakiet.
      </p>

      <p className={styles.checkoutHint}>
        Jeśli firma już istnieje, system pokaże komunikat i poprosi o uzupełnienie
        danych przez formularz zgłoszeniowy{" "}
        <Link
          href="/api/formularz-v2"
          className={styles.inlineLink}
        >
          Pobierz formularz
        </Link>
      </p>

      <div className={styles.checkoutGrid}>
        <label className={styles.field}>
          <span>Wybrany pakiet</span>
          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value as PaidPackage)}
          >
            <option value="standard">STANDARD — od 149.92 zł / mies.</option>
            <option value="premium">PREMIUM — od 249.92 zł / mies.</option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Okres subskrypcji</span>
          <select
            value={billingCycleMonths}
            onChange={(e) => setBillingCycleMonths(Number(e.target.value) as BillingCycleMonths)}
          >
            <option value={1}>1 miesiąc</option>
            <option value={3}>3 miesiące (oszczędzasz)</option>
            <option value={6}>6 miesięcy (większa zniżka)</option>
            <option value={12}>12 miesięcy (najlepsza cena)</option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Wybór metody płatności</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
          >
            <option value="stripe">Stripe</option>
            <option value="przelewy24">Przelewy24</option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Dane firmy — nazwa</span>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="np. Techbit"
          />
        </label>

        <label className={styles.field}>
          <span>Dane firmy — email</span>
          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder="biuro@firma.pl"
          />
        </label>

        <label className={styles.field}>
          <span>Dane firmy — telefon (opcjonalnie)</span>
          <input
            type="text"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            placeholder="+48 ..."
          />
        </label>

        <label className={styles.fieldWide}>
          <span>Krótki opis firmy</span>
          <input
            type="text"
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            placeholder="Montaż SMT/THT, testy, conformal coating..."
          />
        </label>

        <div className={styles.fieldWide}>
          <strong>Dane do faktury (opcjonalnie)</strong>
        </div>

        <label className={styles.field}>
          <span>Osoba kontaktowa</span>
          <input
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="Imię i nazwisko"
          />
        </label>

        <label className={styles.field}>
          <span>Email do faktury</span>
          <input
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            placeholder="faktury@firma.pl"
          />
        </label>

        <label className={styles.field}>
          <span>Telefon do faktury</span>
          <input
            type="text"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            placeholder="+48 ..."
          />
        </label>

        <label className={styles.field}>
          <span>Nazwa na fakturze</span>
          <input
            type="text"
            value={buyerCompanyName}
            onChange={(e) => setBuyerCompanyName(e.target.value)}
            placeholder="Pełna nazwa firmy"
          />
        </label>

        <label className={styles.field}>
          <span>NIP</span>
          <input
            type="text"
            value={buyerTaxId}
            onChange={(e) => setBuyerTaxId(e.target.value)}
            placeholder="PL..."
          />
        </label>

        <label className={styles.fieldWide}>
          <span>Adres (ulica i numer)</span>
          <input
            type="text"
            value={buyerAddressLine1}
            onChange={(e) => setBuyerAddressLine1(e.target.value)}
            placeholder="ul. Przykładowa 1"
          />
        </label>

        <label className={styles.field}>
          <span>Kod pocztowy</span>
          <input
            type="text"
            value={buyerPostalCode}
            onChange={(e) => setBuyerPostalCode(e.target.value)}
            placeholder="00-000"
          />
        </label>

        <label className={styles.field}>
          <span>Miasto</span>
          <input
            type="text"
            value={buyerCity}
            onChange={(e) => setBuyerCity(e.target.value)}
            placeholder="Warszawa"
          />
        </label>

        <label className={styles.field}>
          <span>Kraj</span>
          <input
            type="text"
            value={buyerCountry}
            onChange={(e) => setBuyerCountry(e.target.value)}
            placeholder="Polska"
          />
        </label>
      </div>

      <div className={styles.checkoutSummary}>
        Podsumowanie: <strong>{selectedPackage.toUpperCase()}</strong> —{" "}
        <strong>{total} zł brutto / {billingCycleMonths} mies.</strong>
        <br />
        Średnia miesięczna: <strong>{monthlyAverage.toFixed(2)} zł / mies.</strong>
      </div>

      <div className={styles.checkoutActions}>
        <button type="button" onClick={handleCheckout} disabled={isLoading}>
          {isLoading ? "Przetwarzanie..." : "Przejdź do płatności"}
        </button>

        <button
          type="button"
          onClick={handleConfirmPayment}
          disabled={isLoading || !orderId}
          className={styles.confirmBtn}
        >
          {isLoading ? "Przetwarzanie..." : "Aktywuj pakiet"}
        </button>
      </div>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </section>
  );
}
