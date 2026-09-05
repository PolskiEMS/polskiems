import Link from "next/link";
import { approveCompanyAction } from "@/lib/actions";
import {
  deleteCompanyWithTaxonomyAction,
  getAdminCompaniesWithTaxonomy,
} from "@/lib/adminCompanyTaxonomyActions";
import { COMPANY_TYPE_LABELS } from "@/lib/supplierTaxonomy";
import CompanyActions from "./CompanyActions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type AdminCompany = Awaited<ReturnType<typeof getAdminCompaniesWithTaxonomy>>[number];
type AdminCompaniesSearchParams = {
  q?: string;
  status?: string;
  package?: string;
  featured?: string;
  companyType?: string;
  sort?: string;
};

type AdminCompanyFilters = {
  q: string;
  status: string;
  package: string;
  featured: string;
  companyType: string;
  sort: string;
};

function getPackageLabel(packageType: string | null | undefined) {
  switch (packageType) {
    case "free":
      return "Free";
    case "standard":
      return "Standard";
    case "premium":
      return "Premium";
    default:
      return "-";
  }
}

function getCompanyTypeLabel(companyType: string | null | undefined) {
  return COMPANY_TYPE_LABELS[companyType as keyof typeof COMPANY_TYPE_LABELS] ?? "Nieprzypisane";
}

function getFeaturedLabel(featured: boolean | null | undefined) {
  return featured ? "Tak" : "Nie";
}

function getStatusLabel(isActive: boolean | null | undefined) {
  return isActive ? "Aktywna" : "Oczekuje akceptacji";
}

function getLeadUsageLabel(
  monthlyInquiryCount: number | null | undefined,
  monthlyInquiryLimit: number | null | undefined
) {
  const count = Number(monthlyInquiryCount ?? 0);
  const limit = Number(monthlyInquiryLimit ?? 0);

  return `${count} / ${limit}`;
}

function companyMatchesFilters(company: AdminCompany, filters: AdminCompanyFilters) {
  const query = filters.q.toLowerCase();
  const packageType = company.packageType || "";
  const companyType = company.companyType || "unclassified";
  const companyTypeLabel = getCompanyTypeLabel(companyType);

  const matchesQuery = query
    ? [company.nazwa, company.email, company.www, company.wojewodztwo, companyTypeLabel, String(company.id)].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    : true;
  const matchesStatus =
    filters.status === "active" ? company.isActive : filters.status === "inactive" ? !company.isActive : true;
  const matchesPackage = filters.package ? packageType === filters.package : true;
  const matchesFeatured =
    filters.featured === "yes" ? Boolean(company.featured) : filters.featured === "no" ? !company.featured : true;
  const matchesCompanyType = filters.companyType ? companyType === filters.companyType : true;

  return matchesQuery && matchesStatus && matchesPackage && matchesFeatured && matchesCompanyType;
}

function compareCompaniesBySort(a: AdminCompany, b: AdminCompany, sort: string) {
  switch (sort) {
    case "id-desc":
      return Number(b.id) - Number(a.id);
    case "name-asc":
      return String(a.nazwa || "").localeCompare(String(b.nazwa || ""), "pl", { sensitivity: "base" });
    case "name-desc":
      return String(b.nazwa || "").localeCompare(String(a.nazwa || ""), "pl", { sensitivity: "base" });
    case "package-desc":
      return packageWeight(b.packageType) - packageWeight(a.packageType) || Number(a.id) - Number(b.id);
    case "id-asc":
    default:
      return Number(a.id) - Number(b.id);
  }
}

function packageWeight(packageType: string | null | undefined) {
  if (packageType === "premium") return 3;
  if (packageType === "standard") return 2;
  return 1;
}

function sortCompanies(companies: AdminCompany[], sort: string) {
  return [...companies].sort((a, b) => compareCompaniesBySort(a, b, sort));
}

function buildDisplayCompanies(companies: AdminCompany[], filters: AdminCompanyFilters) {
  const pendingCompanies = sortCompanies(
    companies.filter((company) => !company.isActive),
    filters.sort
  );
  const filteredCompanies = sortCompanies(
    companies.filter((company) => companyMatchesFilters(company, filters)),
    filters.sort
  );
  const pendingIds = new Set(pendingCompanies.map((company) => company.id));
  const filteredWithoutPending = filteredCompanies.filter((company) => !pendingIds.has(company.id));

  return {
    pendingCompanies,
    filteredCompanies: [...pendingCompanies, ...filteredWithoutPending],
  };
}

function renderCompanyActions(company: AdminCompany) {
  return (
    <CompanyActions
      companyId={company.id}
      companyName={company.nazwa || `ID ${company.id}`}
      isActive={company.isActive}
      approveAction={approveCompanyAction}
      deleteAction={deleteCompanyWithTaxonomyAction}
      classNames={{
        actionButtons: styles.actionButtons,
        approveBtn: styles.approveBtn,
        editBtn: styles.editBtn,
        deleteBtn: styles.deleteBtn,
      }}
    />
  );
}

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<AdminCompaniesSearchParams>;
}) {
  const params = await searchParams;
  const validCompanyTypes = new Set(Object.keys(COMPANY_TYPE_LABELS));
  const companyTypeParam = String(params?.companyType || "");
  const filters = {
    q: String(params?.q || "").trim(),
    status: ["active", "inactive"].includes(String(params?.status)) ? String(params.status) : "",
    package: ["free", "standard", "premium"].includes(String(params?.package)) ? String(params.package) : "",
    featured: ["yes", "no"].includes(String(params?.featured)) ? String(params.featured) : "",
    companyType: validCompanyTypes.has(companyTypeParam) ? companyTypeParam : "",
    sort: ["id-asc", "id-desc", "name-asc", "name-desc", "package-desc"].includes(String(params?.sort))
      ? String(params.sort)
      : "id-asc",
  };
  const companies = await getAdminCompaniesWithTaxonomy();
  const { pendingCompanies, filteredCompanies } = buildDisplayCompanies(companies, filters);
  const activeFilterCount = [filters.q, filters.status, filters.package, filters.featured, filters.companyType].filter(Boolean).length +
    (filters.sort !== "id-asc" ? 1 : 0);
  const activeCompanies = companies.filter((company) => company.isActive).length;
  const typedCompanies = companies.filter((company) => company.companyType && company.companyType !== "unclassified").length;
  const premiumCompanies = companies.filter((company) => company.packageType === "premium").length;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Panel administratora</p>
            <h1 className={styles.title}>Firmy i dostawcy</h1>
            <p className={styles.subtitle}>
              Zarządzaj firmami, pakietami i przygotowaniem danych pod nową taksonomię PolskiEMS.
            </p>
          </div>

          <Link href="/admin/firmy/nowa" className={styles.addBtn}>
            Dodaj firmę
          </Link>
        </div>

        <section className={styles.statsGrid} aria-label="Podsumowanie firm">
          <article>
            <span>Wszystkie firmy</span>
            <strong>{companies.length}</strong>
          </article>
          <article>
            <span>Aktywne</span>
            <strong>{activeCompanies}</strong>
          </article>
          <article>
            <span>Premium</span>
            <strong>{premiumCompanies}</strong>
          </article>
          <article>
            <span>Z typem firmy</span>
            <strong>{typedCompanies}</strong>
          </article>
        </section>

        {pendingCompanies.length > 0 && (
          <div className={styles.pendingBox}>
            <strong>Nowe zgłoszenia:</strong> {pendingCompanies.length}. Firmy oczekujące są zawsze widoczne na górze listy.
          </div>
        )}

        <form className={styles.filters}>
          <div className={styles.filterField}>
            <label htmlFor="q">Szukaj firmy</label>
            <input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Nazwa, email, WWW, region lub ID" />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={filters.status}>
              <option value="">Wszystkie</option>
              <option value="active">Aktywne</option>
              <option value="inactive">Oczekujące</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="package">Pakiet</label>
            <select id="package" name="package" defaultValue={filters.package}>
              <option value="">Wszystkie</option>
              <option value="free">Free</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="companyType">Typ firmy</label>
            <select id="companyType" name="companyType" defaultValue={filters.companyType}>
              <option value="">Wszystkie</option>
              {Object.entries(COMPANY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="featured">Wyróżnienie</label>
            <select id="featured" name="featured" defaultValue={filters.featured}>
              <option value="">Wszystkie</option>
              <option value="yes">Tak</option>
              <option value="no">Nie</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="sort">Sortowanie</label>
            <select id="sort" name="sort" defaultValue={filters.sort}>
              <option value="id-asc">ID rosnąco</option>
              <option value="id-desc">ID malejąco</option>
              <option value="name-asc">Nazwa A-Z</option>
              <option value="name-desc">Nazwa Z-A</option>
              <option value="package-desc">Pakiet: Premium → Free</option>
            </select>
          </div>

          <div className={styles.filterActions}>
            <button type="submit" className={styles.filterBtn}>Filtruj</button>
            {activeFilterCount > 0 && <Link href="/admin/firmy" className={styles.clearFiltersBtn}>Wyczyść</Link>}
          </div>
        </form>

        <div className={styles.resultsSummary}>
          Wyświetlane firmy: {filteredCompanies.length} / {companies.length}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Firma</th>
                <th>Typ firmy</th>
                <th>Lokalizacja</th>
                <th>Pakiet</th>
                <th>Leady</th>
                <th>Status</th>
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company: AdminCompany) => (
                <tr key={company.id} className={!company.isActive ? styles.pendingRow : undefined}>
                  <td>{company.id}</td>
                  <td>
                    <strong>{company.nazwa || "-"}</strong>
                    <span className={styles.muted}>{company.email || company.www || "Brak kontaktu"}</span>
                  </td>
                  <td>{getCompanyTypeLabel(company.companyType)}</td>
                  <td>{company.wojewodztwo || "-"}</td>
                  <td><span className={`${styles.badge} ${styles[`package_${company.packageType || "free"}`]}`}>{getPackageLabel(company.packageType)}</span></td>
                  <td>{getLeadUsageLabel(company.monthlyInquiryCount, company.monthlyInquiryLimit)}</td>
                  <td><span className={`${styles.statusBadge} ${company.isActive ? styles.activeStatus : styles.pendingStatus}`}>{getStatusLabel(company.isActive)}</span></td>
                  <td>{renderCompanyActions(company)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.cards}>
          {filteredCompanies.map((company: AdminCompany) => (
            <div key={company.id} className={`${styles.card} ${!company.isActive ? styles.pendingCard : ""}`}>
              <div className={styles.cardTopline}>
                <span>#{company.id}</span>
                <span className={`${styles.statusBadge} ${company.isActive ? styles.activeStatus : styles.pendingStatus}`}>{getStatusLabel(company.isActive)}</span>
              </div>
              <div className={styles.cardTitle}>{company.nazwa || "-"}</div>
              <div className={styles.cardRow}><span className={styles.label}>Typ:</span> {getCompanyTypeLabel(company.companyType)}</div>
              <div className={styles.cardRow}><span className={styles.label}>Region:</span> {company.wojewodztwo || "-"}</div>
              <div className={styles.cardRow}><span className={styles.label}>Email:</span> {company.email || "-"}</div>
              <div className={styles.cardRow}>
                <span className={styles.label}>WWW:</span>{" "}
                {company.www ? <a href={company.www} target="_blank" rel="noreferrer" className={styles.link}>{company.www}</a> : "-"}
              </div>
              <div className={styles.cardRow}><span className={styles.label}>Pakiet:</span> {getPackageLabel(company.packageType)}</div>
              <div className={styles.cardRow}><span className={styles.label}>Wyróżnienie:</span> {getFeaturedLabel(company.featured)}</div>
              <div className={styles.cardRow}><span className={styles.label}>Leady:</span> {getLeadUsageLabel(company.monthlyInquiryCount, company.monthlyInquiryLimit)}</div>
              <div className={styles.cardActions}>{renderCompanyActions(company)}</div>
            </div>
          ))}
        </div>

        <div className={styles.bottomBack}>
          <Link href="/admin" className={styles.backBtn}>
            Powrót do panelu
          </Link>
        </div>
      </div>
    </div>
  );
}
