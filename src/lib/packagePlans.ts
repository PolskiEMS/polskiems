export type PublicPackageType = "free" | "standard" | "premium";
export type PaidPackageType = "standard" | "premium";
export type BillingCycleMonths = 1 | 3 | 6 | 12;

export const BILLING_CYCLES = [1, 3, 6, 12] as const;

export const PACKAGE_PRICE_TOTAL: Record<PaidPackageType, Record<BillingCycleMonths, number>> = {
  standard: { 1: 199, 3: 549, 6: 999, 12: 1799 },
  premium: { 1: 299, 3: 849, 6: 1599, 12: 2999 },
};

export const PACKAGE_INQUIRY_LIMIT: Record<PublicPackageType, number> = {
  free: 5,
  standard: 20,
  premium: 999999,
};

export const PACKAGE_VISIBILITY_PRIORITY: Record<PublicPackageType, number> = {
  free: 0,
  standard: 1,
  premium: 2,
};

export const PACKAGE_BADGE_LABELS: Record<PublicPackageType, string> = {
  free: "Profil producenta",
  standard: "Zweryfikowany profil",
  premium: "Polecany producent",
};

export function isPublicPackageType(value: unknown): value is PublicPackageType {
  return value === "free" || value === "standard" || value === "premium";
}

export function isPaidPackageType(value: unknown): value is PaidPackageType {
  return value === "standard" || value === "premium";
}

export function normalizePackageType(value: unknown): PublicPackageType {
  return isPublicPackageType(value) ? value : "free";
}

export function parseBillingCycleMonths(value: unknown): BillingCycleMonths | null {
  const months = Number(value);
  return BILLING_CYCLES.includes(months as BillingCycleMonths) ? months as BillingCycleMonths : null;
}

export function getPackageConfig(value: unknown) {
  const packageType = normalizePackageType(value);

  return {
    packageType,
    monthlyInquiryLimit: PACKAGE_INQUIRY_LIMIT[packageType],
    visibilityPriority: PACKAGE_VISIBILITY_PRIORITY[packageType],
    badgeLabel: PACKAGE_BADGE_LABELS[packageType],
    // featured = widoczność w sekcji "Polecani producenci" na stronie głównej
    // Standard ma lepszą kartę i statystyki, ale nie trafia automatycznie do polecanych.
    featured: packageType === "premium",
  };
}

export function getPaidPackageConfig(value: unknown) {
  if (!isPaidPackageType(value)) return null;
  return getPackageConfig(value);
}

export function getPackagePriceTotal(packageType: PaidPackageType, billingCycleMonths: BillingCycleMonths) {
  return PACKAGE_PRICE_TOTAL[packageType][billingCycleMonths];
}
