"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type PackageType = "free" | "standard" | "premium";
type PaidPackage = "standard" | "premium";
type ActivationMode = "no_payment" | "bank_transfer";
type BillingCycleMonths = 1 | 3 | 6 | 12;

type SelectOption = {
  id: number;
  nazwa?: string;
  zakres?: string;
};

type SignupStatus = {
  type: "success" | "error";
  text: string;
};

const PACKAGE_LABELS: Record<PackageType, string> = {
  free: "FREE",
  standard: "STANDARD",
  premium: "PREMIUM",
};

const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
const contactHref = "/kontakt";

const PACKAGE_PRICE_TOTAL: Record<PaidPackage, Record<BillingCycleMonths, number>> = {
  standard: { 1: 199, 3: 549, 6: 999, 12: 1799 },
  premium: { 1: 299, 3: 849, 6: 1599, 12: 2999 },
};

function resolvePackage(value: string | null | undefined, fallback: PackageType): PackageType {
  if (value === "premium" || value === "standard" || value === "free") return value;
  return fallback;
}

function isPaidPackage(value: PackageType): value is PaidPackage {
  return value === "standard" || value === "premium";
}

export default function PackageCheckout({
  initialPackage = "standard",
  regions = [],
  dzialania = [],
  produkcja = [],
}: {
  initialPackage?: PackageType;
  regions?: SelectOption[];
  dzialania?: SelectOption[];
  produkcja?: SelectOption[];
}) {
  const searchParams = useSearchParams();
  const packageFromQuery = searchParams.get("pakiet");
  const resolvedPackage = resolvePackage(packageFromQuery, initialPackage);

  const [selectedPackage, setSelectedPackage] = useState<PackageType>(resolvedPackage);
  const [activationMode, setActivationMode] = useState<ActivationMode>("no_payment");
  const [billingCycleMonths, setBillingCycleMonths] = useState<BillingCycleMonths>(1);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyStreet, setCompanyStreet] = useState("");
  const [companyPostalCode, setCompanyPostalCode] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [regionId, setRegionId] = useState("");
  const [selectedDzialaniaIds, setSelectedDzialaniaIds] = useState<number[]>([]);
  const [selectedProdukcjaIds, setSelectedProdukcjaIds] = useState<number[]>([]);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerCompanyName, setBuyerCompanyName] = useState("");
  const [buyerTaxId, setBuyerTaxId] = useState("");
  const [buyerAddressLine1, setBuyerAddressLine1] = useState("");
  const [buyerPostalCode, setBuyerPostalCode] = useState("");
  const [buyerCity, setBuyerCity] = useState("");
  const [status, setStatus] = useState<SignupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const paidPackageSelected = isPaidPackage(selectedPackage);
  const total = paidPackageSelected ? PACKAGE_PRICE_TOTAL[selectedPackage][billingCycleMonths] : 0;
  const monthlyAverage = paidPackageSelected ? Math.round((total / billingCycleMonths) * 100) / 100 : 0;

  function toggleSelection(value: number, selectedValues: number[], setter: (values: number[]) => void) {
    setter(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value]
    );
  }

  function handlePackageChange(packageType: PackageType) {
    setSelectedPackage(packageType);
    if (packageType === "free") {
      setActivationMode("no_payment");
    }
  }

  async function handleActivation() {
    if (!paymentsEnabled) {
      setStatus({ type: "error", text: "Płatności są obecnie w trakcie uruchamiania. Skontaktuj się z PolskiEMS w sprawie wcześniejszej aktywacji pakietu." });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/packages/free-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyEmail,
          companyPhone,
          companyWebsite,
          companyDescription,
          companyStreet,
          companyPostalCode,
          companyCity,
          regionId: regionId ? Number(regionId) : null,
          packageType: selectedPackage,
          activationMode,
          billingCycleMonths,
          dzialaniaIds: selectedDzialaniaIds,
          produkcjaIds: selectedProdukcjaIds,
          buyerName,
          buyerEmail,
          buyerPhone,
          buyerCompanyName,
          buyerTaxId,
          buyerAddressLine1,
          buyerPostalCode,
          buyerCity,
          buyerCountry: "Polska",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data?.code === "COMPANY_EXISTS") {
          setStatus({
            type: "error",
            text: "Firma o podanej nazwie lub adresie e-mail już istnieje w katalogu. Pobierz formularz zgłoszeniowy i wyślij go do administratora, aby zaktualizować lub aktywować pakiet.",
          });
        } else if (data?.code === "VALIDATION_ERROR") {
          setStatus({ type: "error", text: data?.error || "Uzupełnij wymagane dane aktywacji." });
        } else {
          setStatus({ type: "error", text: "Nie udało się zapisać aktywacji. Spróbuj ponownie albo skontaktuj się z nami." });
        }
        return;
      }

      setStatus({
        type: "success",
        text: data.status === "pending_bank_transfer"
          ? `Zgłoszenie pakietu ${PACKAGE_LABELS[selectedPackage]} zostało zapisane. Wyślemy dane do przelewu tradycyjnego i przygotujemy fakturę na podstawie podanych danych.`
          : `Pakiet ${PACKAGE_LABELS[selectedPackage]} został aktywowany bez opłaty. Firma została dodana do katalogu.`,
      });
      setCompanyName("");
      setCompanyEmail("");
      setCompanyPhone("");
      setCompanyWebsite("");
      setCompanyDescription("");
      setCompanyStreet("");
      setCompanyPostalCode("");
      setCompanyCity("");
      setRegionId("");
      setSelectedDzialaniaIds([]);
      setSelectedProdukcjaIds([]);
      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("");
      setBuyerCompanyName("");
      setBuyerTaxId("");
      setBuyerAddressLine1("");
      setBuyerPostalCode("");
      setBuyerCity("");
    } catch {
      setStatus({ type: "error", text: "Wystąpił problem z połączeniem. Spróbuj ponownie za chwilę." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className={styles.checkoutSection}>
      <h3>Dane aktywacji</h3>
      {!paymentsEnabled && (
        <div className={styles.paymentsNotice}>
          Zakup pakietów online jest obecnie w trakcie uruchamiania. Cennik pozostaje aktualny. W sprawie wcześniejszej aktywacji pakietu skontaktuj się z PolskiEMS.
        </div>
      )}
      <p className={styles.checkoutHint}>
        {paymentsEnabled
          ? "Uzupełnij dane firmy. Pakiet Standard lub Premium możesz aktywować bez opłaty albo zgłosić do przelewu tradycyjnego z fakturą."
          : "Aktywacja online i zgłoszenia do przelewu tradycyjnego są obecnie w trakcie uruchamiania."}
      </p>
      <p className={styles.checkoutHint}>
        Jeśli firma już istnieje, system pokaże komunikat. Wtedy pobierz formularz zgłoszeniowy:{" "}
        <Link href="/api/formularz-v2" className={styles.inlineLink}>Pobierz formularz</Link>
      </p>

      <div className={styles.checkoutGrid}>
        <label className={styles.field}>
          <span>Wybrany pakiet</span>
          <select value={selectedPackage} onChange={(e) => handlePackageChange(e.target.value as PackageType)}>
            <option value="free">FREE — bez opłaty</option>
            <option value="standard">STANDARD</option>
            <option value="premium">PREMIUM</option>
          </select>
        </label>

        {paidPackageSelected && (
          <label className={styles.field}>
            <span>Sposób aktywacji</span>
            <select value={activationMode} onChange={(e) => setActivationMode(e.target.value as ActivationMode)}>
              <option value="no_payment">Aktywacja bez opłaty</option>
              <option value="bank_transfer">Przelew tradycyjny + faktura</option>
            </select>
          </label>
        )}

        {paidPackageSelected && activationMode === "bank_transfer" && (
          <label className={styles.field}>
            <span>Okres subskrypcji</span>
            <select value={billingCycleMonths} onChange={(e) => setBillingCycleMonths(Number(e.target.value) as BillingCycleMonths)}>
              <option value={1}>1 miesiąc</option>
              <option value={3}>3 miesiące</option>
              <option value={6}>6 miesięcy</option>
              <option value={12}>12 miesięcy</option>
            </select>
          </label>
        )}

        <label className={styles.field}>
          <span>Dane firmy — nazwa</span>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </label>

        <label className={styles.field}>
          <span>Dane firmy — email</span>
          <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} required />
        </label>

        <label className={styles.field}>
          <span>Dane firmy — telefon</span>
          <input type="text" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
        </label>

        <label className={styles.field}>
          <span>Strona WWW</span>
          <input type="text" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://..." />
        </label>

        <label className={styles.field}>
          <span>Województwo</span>
          <select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
            <option value="">Wybierz województwo</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>{region.nazwa}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Ulica i numer</span>
          <input type="text" value={companyStreet} onChange={(e) => setCompanyStreet(e.target.value)} placeholder="np. ul. Przemysłowa 10" />
        </label>

        <label className={styles.field}>
          <span>Kod pocztowy</span>
          <input type="text" value={companyPostalCode} onChange={(e) => setCompanyPostalCode(e.target.value)} placeholder="00-000" />
        </label>

        <label className={styles.field}>
          <span>Miasto</span>
          <input type="text" value={companyCity} onChange={(e) => setCompanyCity(e.target.value)} />
        </label>

        <label className={styles.fieldWide}>
          <span>Krótki opis firmy</span>
          <textarea rows={4} value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} />
        </label>
      </div>

      <div className={styles.optionsSection}>
        <h4>Usługi EMS oferowane przez firmę</h4>
        <div className={styles.optionsGrid}>
          {dzialania.map((item) => (
            <label key={item.id} className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={selectedDzialaniaIds.includes(item.id)}
                onChange={() => toggleSelection(item.id, selectedDzialaniaIds, setSelectedDzialaniaIds)}
              />
              <span>{item.nazwa}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.optionsSection}>
        <h4>Skala produkcji</h4>
        <div className={styles.optionsGrid}>
          {produkcja.map((item) => (
            <label key={item.id} className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={selectedProdukcjaIds.includes(item.id)}
                onChange={() => toggleSelection(item.id, selectedProdukcjaIds, setSelectedProdukcjaIds)}
              />
              <span>{item.zakres}</span>
            </label>
          ))}
        </div>
      </div>

      {paidPackageSelected && activationMode === "bank_transfer" && (
        <div className={styles.invoiceSection}>
          <h4>Dane do faktury</h4>
          <div className={styles.checkoutGrid}>
            <label className={styles.field}>
              <span>Osoba kontaktowa</span>
              <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Email do faktury</span>
              <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Telefon do faktury</span>
              <input type="text" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Nazwa firmy do faktury</span>
              <input type="text" value={buyerCompanyName} onChange={(e) => setBuyerCompanyName(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>NIP</span>
              <input type="text" value={buyerTaxId} onChange={(e) => setBuyerTaxId(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Adres do faktury</span>
              <input type="text" value={buyerAddressLine1} onChange={(e) => setBuyerAddressLine1(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Kod pocztowy</span>
              <input type="text" value={buyerPostalCode} onChange={(e) => setBuyerPostalCode(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Miasto</span>
              <input type="text" value={buyerCity} onChange={(e) => setBuyerCity(e.target.value)} />
            </label>
          </div>
        </div>
      )}

      <div className={styles.checkoutSummary}>
        {paidPackageSelected && activationMode === "bank_transfer" ? (
          <>
            Podsumowanie: <strong>{PACKAGE_LABELS[selectedPackage]}</strong> — <strong>{total} zł brutto / {billingCycleMonths} mies.</strong><br />
            Średnia miesięczna: <strong>{monthlyAverage.toFixed(2)} zł / mies.</strong>
          </>
        ) : (
          <>Podsumowanie: <strong>{PACKAGE_LABELS[selectedPackage]}</strong> — aktywacja bez opłaty.</>
        )}
      </div>
      <div className={styles.checkoutActions}>
        <button
          type="button"
          onClick={handleActivation}
          disabled={isLoading || !paymentsEnabled}
          aria-disabled={!paymentsEnabled ? "true" : undefined}
        >
          {!paymentsEnabled
            ? "Płatności w trakcie uruchamiania"
            : isLoading
              ? "Zapisywanie..."
              : paidPackageSelected && activationMode === "bank_transfer"
                ? "Zgłoś do przelewu i faktury"
                : `Aktywuj pakiet ${PACKAGE_LABELS[selectedPackage]}`}
        </button>
        {!paymentsEnabled && (
          <Link href={contactHref} className={styles.contactPackageCta}>
            Skontaktuj się w sprawie pakietu
          </Link>
        )}
      </div>
      <p className={styles.checkoutHint}>
        {!paymentsEnabled
          ? "Nie wysyłamy formularza aktywacji ani zgłoszenia do przelewu. Skontaktuj się z PolskiEMS, aby omówić wcześniejszą aktywację pakietu."
          : paidPackageSelected && activationMode === "bank_transfer"
            ? "Po wysłaniu formularza administrator otrzyma zgłoszenie do faktury i przelewu tradycyjnego."
            : "Nie pobieramy płatności. Pakiet zostanie aktywowany od razu po wysłaniu formularza."}
      </p>
      {status?.type === "success" && <p className={styles.success}>{status.text}</p>}
      {status?.type === "error" && <p className={styles.error}>{status.text}</p>}
    </section>
  );
}
