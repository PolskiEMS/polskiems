"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type PackageType = "free" | "standard" | "premium";

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

function resolvePackage(value: string | null | undefined, fallback: PackageType): PackageType {
  if (value === "premium" || value === "standard" || value === "free") return value;
  return fallback;
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
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [regionId, setRegionId] = useState("");
  const [selectedDzialaniaIds, setSelectedDzialaniaIds] = useState<number[]>([]);
  const [selectedProdukcjaIds, setSelectedProdukcjaIds] = useState<number[]>([]);
  const [status, setStatus] = useState<SignupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function toggleSelection(value: number, selectedValues: number[], setter: (values: number[]) => void) {
    setter(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value]
    );
  }

  async function handleActivation() {
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
          companyAddress,
          regionId: regionId ? Number(regionId) : null,
          packageType: selectedPackage,
          dzialaniaIds: selectedDzialaniaIds,
          produkcjaIds: selectedProdukcjaIds,
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
          setStatus({ type: "error", text: "Uzupełnij nazwę firmy, e-mail oraz wybierz pakiet." });
        } else {
          setStatus({ type: "error", text: "Nie udało się aktywować pakietu. Spróbuj ponownie albo skontaktuj się z nami." });
        }
        return;
      }

      setStatus({
        type: "success",
        text: `Pakiet ${PACKAGE_LABELS[selectedPackage]} został aktywowany bez opłaty. Firma została dodana do katalogu.`,
      });
      setCompanyName("");
      setCompanyEmail("");
      setCompanyPhone("");
      setCompanyWebsite("");
      setCompanyDescription("");
      setCompanyAddress("");
      setRegionId("");
      setSelectedDzialaniaIds([]);
      setSelectedProdukcjaIds([]);
    } catch {
      setStatus({ type: "error", text: "Wystąpił problem z połączeniem. Spróbuj ponownie za chwilę." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className={styles.checkoutSection}>
      <h3>Dane aktywacji</h3>
      <p className={styles.checkoutHint}>
        Uzupełnij dane firmy i aktywuj pakiet Standard lub Premium bez płatności online.
      </p>
      <p className={styles.checkoutHint}>
        Jeśli firma już istnieje, system pokaże komunikat. Wtedy pobierz formularz zgłoszeniowy:{" "}
        <Link href="/api/formularz-v2" className={styles.inlineLink}>Pobierz formularz</Link>
      </p>

      <div className={styles.checkoutGrid}>
        <label className={styles.field}>
          <span>Wybrany pakiet</span>
          <select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value as PackageType)}>
            <option value="free">FREE — bez opłaty</option>
            <option value="standard">STANDARD — aktywacja bez opłaty</option>
            <option value="premium">PREMIUM — aktywacja bez opłaty</option>
          </select>
        </label>

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

        <label className={styles.fieldWide}>
          <span>Adres firmy</span>
          <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="ulica, kod pocztowy, miasto" />
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

      <div className={styles.checkoutSummary}>
        Podsumowanie: <strong>{PACKAGE_LABELS[selectedPackage]}</strong> — aktywacja bez opłaty.
      </div>
      <div className={styles.checkoutActions}>
        <button type="button" onClick={handleActivation} disabled={isLoading}>
          {isLoading ? "Aktywowanie..." : `Aktywuj pakiet ${PACKAGE_LABELS[selectedPackage]}`}
        </button>
      </div>
      <p className={styles.checkoutHint}>Nie pobieramy płatności. Pakiet zostanie aktywowany od razu po wysłaniu formularza.</p>
      {status?.type === "success" && <p className={styles.success}>{status.text}</p>}
      {status?.type === "error" && <p className={styles.error}>{status.text}</p>}
    </section>
  );
}
