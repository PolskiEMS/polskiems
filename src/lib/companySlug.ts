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
