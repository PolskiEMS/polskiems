"use client";

import { useMemo, useState } from "react";
import styles from "./styles.module.css";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FreePackageSignup from "../aktywacja_pakietu/FreePackageSignup";

type PaidPackage = "standard" | "premium";
type PackageType = "free" | PaidPackage;
type Provider = "stripe" | "przelewy24";

const PACKAGE_PRICE: Record<PaidPackage, number> = {
  standard: 199,
  premium: 299,
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
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const total = useMemo(() => PACKAGE_PRICE[selectedPackage], [selectedPackage]);

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
      setMessage(`Utworzono zamówienie #${data.orderId} dla ${data.companyName}.`);
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
          : `Płatność potwierdzona. Pakiet ${String(data.activatedPackage).toUpperCase()} aktywowany.`
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
          href="/formularz_zgloszeniowy_firmy.docx"
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
            <option value="standard">STANDARD — 199 zł / mies.</option>
            <option value="premium">PREMIUM — 299 zł / mies.</option>
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
      </div>

      <div className={styles.checkoutSummary}>
        Podsumowanie: <strong>{selectedPackage.toUpperCase()}</strong> —{" "}
        <strong>{total} zł brutto / mies.</strong>
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