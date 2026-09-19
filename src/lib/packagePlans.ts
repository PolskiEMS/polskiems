export type PackageType = "free" | "standard" | "premium";
export type PaidPackage = Exclude<PackageType, "free">;
export type BillingCycleMonths = 1 | 3 | 6 | 12;

export const PACKAGE_ORDER: PackageType[] = ["free", "standard", "premium"];

export const PACKAGE_PLANS = {
  free: {
    key: "free" as const,
    name: "FREE",
    priceMonthly: 0,
    monthlyInquiryLimit: 5,
    featured: false,
    description: "Podstawowa obecność w katalogu PolskiEMS dla firm, które chcą być widoczne i odbierać pierwsze zapytania RFQ.",
    publicBenefits: [
      "Obecność firmy w katalogu",
      "Podstawowy profil i dane kontaktowe",
      "Podstawowe usługi i skala produkcji",
      "Do 5 zapytań ofertowych miesięcznie",
      "Brak opłaty miesięcznej",
    ],
  },
  standard: {
    key: "standard" as const,
    name: "STANDARD",
    priceMonthly: 199,
    monthlyInquiryLimit: 20,
    featured: true,
    description: "Pełny profil firmy, większa widoczność i mierzalne efekty obecności w PolskiEMS.",
    prices: { 1: 199, 3: 549, 6: 999, 12: 1799 } as Record<BillingCycleMonths, number>,
    publicBenefits: [
      "Pełny profil: usługi, technologie, branże i certyfikaty",
      "Lepsza widoczność niż profile Free",
      "Wyróżniona karta producenta",
      "Do 20 zapytań ofertowych miesięcznie",
      "Miesięczny raport skuteczności profilu",
      "Wyświetlenia, kliknięcia WWW/e-mail i podstawowy CTR",
    ],
  },
  premium: {
    key: "premium" as const,
    name: "PREMIUM",
    priceMonthly: 299,
    monthlyInquiryLimit: 999999,
    featured: true,
    description: "Maksymalna ekspozycja i rozszerzona analityka dla firm aktywnie pozyskujących projekty przez PolskiEMS.",
    prices: { 1: 299, 3: 849, 6: 1599, 12: 2999 } as Record<BillingCycleMonths, number>,
    publicBenefits: [
      "Pełny, wyróżniony profil producenta",
      "Najwyższy priorytet w domyślnym katalogu",
      "Priorytet pomocniczy przy równym dopasowaniu RFQ",
      "Nielimitowane zapytania ofertowe",
      "Rozszerzony raport i analityka profilu",
      "CTR, potencjał leadowy i rekomendacje optymalizacji",
    ],
  },
} as const;

export function isPackageType(value: unknown): value is PackageType {
  return value === "free" || value === "standard" || value === "premium";
}

export function isPaidPackage(value: PackageType): value is PaidPackage {
  return value === "standard" || value === "premium";
}

export function getPackageConfig(value: unknown) {
  const packageType: PackageType = isPackageType(value) ? value : "free";
  const plan = PACKAGE_PLANS[packageType];

  return {
    packageType,
    featured: plan.featured,
    monthlyInquiryLimit: plan.monthlyInquiryLimit,
  };
}

export function getPackagePrice(packageType: PaidPackage, months: BillingCycleMonths) {
  return PACKAGE_PLANS[packageType].prices[months];
}
