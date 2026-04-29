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
  standard: { 1: 199, 3: 549, 6: 999, 12: 1799 },
  premium: { 1: 299, 3: 849, 6: 1599, 12: 2999 },
};

export default function PackageCheckout({ initialPackage = "standard" }: { initialPackage?: PackageType }) {
  const searchParams = useSearchParams();
  const packageFromQuery = searchParams.get("pakiet");
  const resolvedPackage: PackageType = packageFromQuery === "premium" ? "premium" : packageFromQuery === "free" ? "free" : initialPackage;

  if (resolvedPackage === "free") return <FreePackageSignup />;

  const [selectedPackage, setSelectedPackage] = useState<PaidPackage>(resolvedPackage === "premium" ? "premium" : "standard");
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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const total = useMemo(() => PACKAGE_PRICE_TOTAL[selectedPackage][billingCycleMonths], [selectedPackage, billingCycleMonths]);
  const monthlyAverage = useMemo(() => Math.round((total / billingCycleMonths) * 100) / 100, [total, billingCycleMonths]);

  async function handleCheckout() {
    setIsLoading(true);
    setError("");
    setMessage("");

    if (provider === "przelewy24") {
      setError("Płatność przez Przelewy24 jest obecnie przygotowywana. Wybierz płatność online Stripe albo skontaktuj się z nami w celu otrzymania danych do przelewu tradycyjnego.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/packages/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, companyEmail, companyPhone, companyDescription, buyerName, buyerEmail, buyerPhone, buyerCompanyName, buyerTaxId, buyerAddressLine1, buyerPostalCode, buyerCity, buyerCountry, billingCycleMonths, packageType: selectedPackage, provider }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data?.code === "COMPANY_EXISTS") {
          setError("Firma o podanych danych prawdopodobnie już istnieje w katalogu. Skontaktuj się z nami, aby rozszerzyć obecny profil do pakietu Standard lub Premium.");
        } else if (data?.code === "VALIDATION_ERROR") {
          setError("Uzupełnij wymagane dane firmy przed przejściem do płatności.");
        } else if (data?.code === "PROVIDER_NOT_AVAILABLE") {
          setError("Płatność przez Przelewy24 jest obecnie przygotowywana. Wybierz płatność online Stripe albo skontaktuj się z nami w celu otrzymania danych do przelewu tradycyjnego.");
        } else {
          setError("Nie udało się rozpocząć płatności. Pakiet nie został aktywowany ani zapisany jako Free. Spróbuj ponownie albo skontaktuj się z nami.");
        }
        return;
      }

      if (data.checkoutUrl || data.url) {
        setMessage("Przekierowujemy do bezpiecznej płatności online. Po opłaceniu pakietu wrócisz na stronę PolskiEMS.");
        window.location.href = data.checkoutUrl || data.url;
        return;
      }

      setError("Nie udało się rozpocząć płatności. Pakiet nie został aktywowany ani zapisany jako Free. Spróbuj ponownie albo skontaktuj się z nami.");
    } catch {
      setError("Wystąpił problem z połączeniem. Pakiet nie został aktywowany. Spróbuj ponownie za chwilę.");
    } finally {
      setIsLoading(false);
    }
  }

  return <section className={styles.checkoutSection}>{/* truncated for brevity? */}
    <h3>Dane aktywacji</h3>
    <p className={styles.checkoutHint}>Uzupełnij dane firmy, wybierz metodę płatności i przejdź do bezpiecznej płatności online.</p>
    <p className={styles.checkoutHint}>Jeśli firma już istnieje, system pokaże komunikat i poprosi o uzupełnienie danych przez formularz zgłoszeniowy <Link href="/api/formularz-v2" className={styles.inlineLink}>Pobierz formularz</Link></p>
    <div className={styles.checkoutGrid}><label className={styles.field}><span>Wybrany pakiet</span><select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value as PaidPackage)}><option value="standard">STANDARD — od 149.92 zł / mies.</option><option value="premium">PREMIUM — od 249.92 zł / mies.</option></select></label>
    <label className={styles.field}><span>Okres subskrypcji</span><select value={billingCycleMonths} onChange={(e) => setBillingCycleMonths(Number(e.target.value) as BillingCycleMonths)}><option value={1}>1 miesiąc</option><option value={3}>3 miesiące (oszczędzasz)</option><option value={6}>6 miesięcy (większa zniżka)</option><option value={12}>12 miesięcy (najlepsza cena)</option></select></label>
    <label className={styles.field}><span>Wybór metody płatności</span><select value={provider} onChange={(e) => setProvider(e.target.value as Provider)}><option value="stripe">Płatność online Stripe</option><option value="przelewy24" disabled>Przelewy online / Przelewy24 — wkrótce</option></select></label>
    <label className={styles.field}><span>Dane firmy — nazwa</span><input type="text" value={companyName} onChange={(e)=>setCompanyName(e.target.value)} /></label>
    <label className={styles.field}><span>Dane firmy — email</span><input type="email" value={companyEmail} onChange={(e)=>setCompanyEmail(e.target.value)} /></label>
    <label className={styles.field}><span>Dane firmy — telefon (opcjonalnie)</span><input type="text" value={companyPhone} onChange={(e)=>setCompanyPhone(e.target.value)} /></label>
    <label className={styles.fieldWide}><span>Krótki opis firmy</span><input type="text" value={companyDescription} onChange={(e)=>setCompanyDescription(e.target.value)} /></label>
    </div>
    <div className={styles.checkoutSummary}>Podsumowanie: <strong>{selectedPackage.toUpperCase()}</strong> — <strong>{total} zł brutto / {billingCycleMonths} mies.</strong><br/>Średnia miesięczna: <strong>{monthlyAverage.toFixed(2)} zł / mies.</strong></div>
    <div className={styles.checkoutActions}><button type="button" onClick={handleCheckout} disabled={isLoading}>{isLoading ? "Przetwarzanie..." : "Przejdź do bezpiecznej płatności"}</button></div>
    <p className={styles.checkoutHint}>Pakiet zostanie aktywowany po potwierdzeniu płatności. W przypadku problemu płatność nie powoduje utworzenia pakietu Free.</p>
    {message && <p className={styles.success}>{message}</p>}
    {error && <p className={styles.error}>{error}</p>}
  </section>;
}
