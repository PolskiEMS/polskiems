export function companyNameToSlug(companyName: string) {
  return companyName
    .replace(/[Łł]/g, (letter) => (letter === "Ł" ? "L" : "l"))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function companyProfileSlug(companyName: string, companyId: number) {
  return `${companyNameToSlug(companyName)}-${companyId}`;
}

export function companyIdFromSlug(slug: string) {
  const match = slug.match(/(?:^|-)([1-9]\d*)$/);
  return match ? Number(match[1]) : null;
}
