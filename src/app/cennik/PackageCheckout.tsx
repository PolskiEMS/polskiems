"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  PACKAGE_PLANS,
  getPackagePrice,
  isPaidPackage,
  type BillingCycleMonths,
  type PackageType,
} from "@/lib/packagePlans";

type BasicOption = {
  id: number;
  nazwa?: string;
  zakres?: string;
};

type TaxonomyOption = {
  id: number;
  slug?: string;
  code?: string;
  name: string;
};

type CompanyTypeOption = {
  value: string;
  label: string;
};

type SignupStatus = {
  type: "success" | "error";
  text: string;
};

const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
const contactHref = "/kontakt";

function resolvePackage(value: string | null | undefined, fallback: PackageType): PackageType {
  if (value === "premium" || value === "standard" || value === "free") return value;
  return fallback;
}

export default function PackageCheckout({
  initialPackage = "standard",
  regions = [],
  produkcja = [],
  companyTypes = [],
  services = [],
  capabilities = [],
  industries = [],
  certifications = [],
  producerSignupMode = false,
}: {
  initialPackage?: PackageType;
  regions?: BasicOption[];
  produkcja?: BasicOption[];
  companyTypes?: CompanyTypeOption[];
  services?: TaxonomyOption[];
  capabilities?: TaxonomyOption[];
  industries?: TaxonomyOption[];
  certifications?: TaxonomyOption[];
  producerSignupMode?: boolean;
}) {
  const searchParams = useSearchParams();
  const packageFromQuery = searchParams.get("pakiet");
  const resolvedPackage = resolvePackage(packageFromQuery, initialPackage);

  const [signupMode, setSignupMode] = useState<"new" | "existing">("new");
  const [selectedPackage, setSelectedPackage] = useState<PackageType>(resolvedPackage);
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
  const [companyType, setCompanyType] = useState("ems");
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedCapabilityIds, setSelectedCapabilityIds] = useState<number[]>([]);
  const [selectedIndustryIds, setSelectedIndustryIds] = useState<number[]>([]);
  const [selectedCertificationIds, setSelectedCertificationIds] = useState<number[]>([]);
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
  const requiresBillingDetails = paidPackageSelected;
  const canSubmit =
    selectedPackage === "free" ||
    producerSignupMode ||
    paymentsEnabled;
  const total = selectedPackage === "free" ? 0 : getPackagePrice(selectedPackage, billingCycleMonths);
  const monthlyAverage = selectedPackage === "free" ? 0 : Math.round((total / billingCycleMonths) * 100) / 100;

  function toggleSelection(value: number, selectedValues: number[], setter: (values: number[]) => void) {
    setter(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value]
    );
  }

  function resetForm() {
    setCompanyName("");
    setCompanyEmail("");
    setCompanyPhone("");
    setCompanyWebsite("");
    setCompanyDescription("");
    setCompanyStreet("");
    setCompanyPostalCode("");
    setCompanyCity("");
    setRegionId("");
    setCompanyType("ems");
    setSelectedServiceIds([]);
    setSelectedCapabilityIds([]);
    setSelectedIndustryIds([]);
    setSelectedCertificationIds([]);
    setSelectedProdukcjaIds([]);
    setBuyerName("");
    setBuyerEmail("");
    setBuyerPhone("");
    setBuyerCompanyName("");
    setBuyerTaxId("");
    setBuyerAddressLine1("");
    setBuyerPostalCode("");
    setBuyerCity("");
  }

  async function handleActivation() {
    if (!canSubmit) {
      setStatus({
        type: "error",
        text: "Aktywacja płatnych pakietów online jest obecnie w trakcie uruchamiania. Skontaktuj się z PolskiEMS.",
      });
      return;
    }

    if (selectedServiceIds.length === 0) {
      setStatus({ type: "error", text: "Wybierz co najmniej jedną usługę firmy." });
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
          companyType,
          packageType: selectedPackage,
          activationMode: paidPackageSelected ? "bank_transfer" : "no_payment",
          billingCycleMonths,
          serviceIds: selectedServiceIds,
          capabilityIds: selectedCapabilityIds,
          industryIds: selectedIndustryIds,
          certificationIds: selectedCertificationIds,
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
            text: "Firma o podanej nazwie lub adresie e-mail już istnieje. Wybierz tryb „Moja firma już istnieje”, aby zgłosić aktualizację lub zmianę pakietu.",
          });
          setSignupMode("existing");
        } else if (data?.code === "VALIDATION_ERROR") {
          setStatus({ type: "error", text: data?.error || "Uzupełnij wymagane dane zgłoszenia." });
        } else {
          setStatus({ type: "error", text: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie albo skontaktuj się z nami." });
        }
        return;
      }

      setStatus({
        type: "success",
        text: paidPackageSelected
          ? `Zgłoszenie firmy i pakietu ${PACKAGE_PLANS[selectedPackage].name} zostało zapisane. Profil czeka na weryfikację administratora; skontaktujemy się także w sprawie rozliczenia i aktywacji pakietu.`
          : "Zgłoszenie firmy zostało zapisane. Profil FREE czeka na weryfikację administratora przed publikacją.",
      });
      resetForm();
    } catch {
      setStatus({ type: "error", text: "Wystąpił problem z połączeniem. Spróbuj ponownie za chwilę." });
    } finally {
      setIsLoading(false);
    }
  }

  function renderOptions(
    title: string,
    description: string,
    options: TaxonomyOption[],
    selectedValues: number[],
    setter: (values: number[]) => void
  ) {
    return (
      <div className={styles.optionsSection}>
        <h4>{title}</h4>
        <p className={styles.checkoutHint}>{description}</p>
        <div className={styles.optionsGrid}>
          {options.map((item) => (
            <label key={item.id} className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={selectedValues.includes(item.id)}
                onChange={() => toggleSelection(item.id, selectedValues, setter)}
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className={styles.checkoutSection}>
      <h3>{producerSignupMode ? "Zgłoszenie firmy do PolskiEMS" : "Dane aktywacji"}</h3>

      {producerSignupMode && (
        <div className={styles.checkoutGrid}>
          <label className={styles.field}>
            <span>Co chcesz zrobić?</span>
            <select value={signupMode} onChange={(e) => setSignupMode(e.target.value as "new" | "existing")}>
              <option value="new">Dodaj nową firmę</option>
              <option value="existing">Moja firma już istnieje</option>
            </select>
          </label>
        </div>
      )}

      {producerSignupMode && signupMode === "existing" ? (
        <div className={styles.invoiceSection}>
          <h4>Moja firma już istnieje w PolskiEMS</h4>
          <p className={styles.checkoutHint}>
            Nie twórz drugiego profilu. Wyślij zgłoszenie aktualizacji danych, rozszerzenia profilu albo zmiany pakietu.
          </p>
          <div className={styles.checkoutActions}>
            <Link href="/kontakt" className={styles.contactPackageCta}>
              Zgłoś aktualizację profilu
            </Link>
            <Link href="/cennik" className={styles.contactPackageCta}>
              Porównaj pakiety
            </Link>
          </div>
        </div>
      ) : (
        <>
          {!paymentsEnabled && !producerSignupMode && paidPackageSelected && (
            <div className={styles.paymentsNotice}>
              Aktywacja płatnych pakietów online jest obecnie w trakcie uruchamiania. Pakiet FREE pozostaje dostępny bezpłatnie.
            </div>
          )}

          <p className={styles.checkoutHint}>
            {producerSignupMode
              ? "Uzupełnij dane zgodne z profilem firmy. Wszystkie nowe zgłoszenia trafiają najpierw do weryfikacji administratora."
              : selectedPackage === "free"
                ? "Pakiet FREE możesz zgłosić bez opłaty. Profil zostanie opublikowany po weryfikacji."
                : "Pakiety Standard i Premium wymagają płatnej aktywacji. Publiczna aktywacja bez opłaty nie jest dostępna."}
          </p>

          <div className={styles.checkoutGrid}>
            <label className={styles.field}>
              <span>Wybrany pakiet</span>
              <select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value as PackageType)}>
                <option value="free">FREE — bez opłaty</option>
                <option value="standard">STANDARD</option>
                <option value="premium">PREMIUM</option>
              </select>
            </label>

            {paidPackageSelected && (
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

            {producerSignupMode && (
              <label className={styles.field}>
                <span>Typ firmy *</span>
                <select value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
                  {companyTypes.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
            )}

            <label className={styles.field}>
              <span>Nazwa firmy *</span>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </label>

            <label className={styles.field}>
              <span>E-mail firmy *</span>
              <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} required />
            </label>

            <label className={styles.field}>
              <span>Telefon</span>
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
              <span>Opis firmy</span>
              <textarea rows={5} value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} />
            </label>
          </div>

          {producerSignupMode && (
            <>
              {renderOptions(
                "Usługi *",
                "Wybierz usługi, po których klienci mają znajdować firmę i które będą używane w dopasowaniu RFQ.",
                services,
                selectedServiceIds,
                setSelectedServiceIds
              )}
              {renderOptions(
                "Możliwości technologiczne",
                "Np. AOI, SPI, X-Ray, BGA, testy funkcjonalne lub zabezpieczanie elektroniki.",
                capabilities,
                selectedCapabilityIds,
                setSelectedCapabilityIds
              )}
              {renderOptions(
                "Branże",
                "Wskaż branże, dla których firma realizuje projekty.",
                industries,
                selectedIndustryIds,
                setSelectedIndustryIds
              )}
              {renderOptions(
                "Certyfikaty i standardy",
                "Zaznacz wyłącznie certyfikaty i standardy rzeczywiście posiadane lub stosowane przez firmę.",
                certifications,
                selectedCertificationIds,
                setSelectedCertificationIds
              )}

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
            </>
          )}

          {requiresBillingDetails && (
            <div className={styles.invoiceSection}>
              <h4>Dane do rozliczenia pakietu</h4>
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
                  <span>Nazwa firmy do faktury *</span>
                  <input type="text" value={buyerCompanyName} onChange={(e) => setBuyerCompanyName(e.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>NIP *</span>
                  <input type="text" value={buyerTaxId} onChange={(e) => setBuyerTaxId(e.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Adres do faktury *</span>
                  <input type="text" value={buyerAddressLine1} onChange={(e) => setBuyerAddressLine1(e.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Kod pocztowy *</span>
                  <input type="text" value={buyerPostalCode} onChange={(e) => setBuyerPostalCode(e.target.value)} />
                </label>
                <label className={styles.field}>
                  <span>Miasto *</span>
                  <input type="text" value={buyerCity} onChange={(e) => setBuyerCity(e.target.value)} />
                </label>
              </div>
            </div>
          )}

          <div className={styles.checkoutSummary}>
            {paidPackageSelected ? (
              <>
                Podsumowanie: <strong>{PACKAGE_PLANS[selectedPackage].name}</strong> — <strong>{total} zł brutto / {billingCycleMonths} mies.</strong><br />
                Średnia miesięczna: <strong>{monthlyAverage.toFixed(2)} zł / mies.</strong>
              </>
            ) : (
              <>Podsumowanie: <strong>FREE</strong> — bez opłaty. Publikacja po weryfikacji zgłoszenia.</>
            )}
          </div>

          <div className={styles.checkoutActions}>
            <button
              type="button"
              onClick={handleActivation}
              disabled={isLoading || !canSubmit}
              aria-disabled={!canSubmit ? "true" : undefined}
            >
              {!canSubmit
                ? "Płatności w trakcie uruchamiania"
                : isLoading
                  ? "Zapisywanie..."
                  : producerSignupMode
                    ? "Wyślij zgłoszenie do weryfikacji"
                    : selectedPackage === "free"
                      ? "Zgłoś profil FREE"
                      : "Zgłoś pakiet płatny"}
            </button>
            {!canSubmit && (
              <Link href={contactHref} className={styles.contactPackageCta}>
                Skontaktuj się w sprawie pakietu
              </Link>
            )}
          </div>

          {status?.type === "success" && <p className={styles.success}>{status.text}</p>}
          {status?.type === "error" && <p className={styles.error}>{status.text}</p>}
        </>
      )}
    </section>
  );
}
