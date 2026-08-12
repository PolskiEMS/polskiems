import Link from "next/link";
import { approveCompanyAction, deleteCompanyAction, getAdminCompanies } from "@/lib/actions";
import CompanyActions from "./CompanyActions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type AdminCompany = Awaited<ReturnType<typeof getAdminCompanies>>[number];
type AdminCompaniesSearchParams = {
  q?: string;
  status?: string;
  package?: string;
  featured?: string;
  sort?: string;
};

type AdminCompanyFilters = {
  q: string;
  status: string;
  package: string;
  featured: string;
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

  const matchesQuery = query
    ? [company.nazwa, company.email, company.www, String(company.id)].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    : true;
  const matchesStatus =
    filters.status === "active" ? company.isActive : filters.status === "inactive" ? !company.isActive : true;
  const matchesPackage = filters.package ? packageType === filters.package : true;
  const matchesFeatured =
    filters.featured === "yes" ? Boolean(company.featured) : filters.featured === "no" ? !company.featured : true;

  return matchesQuery && matchesStatus && matchesPackage && matchesFeatured;
}

function compareCompaniesBySort(a: AdminCompany, b: AdminCompany, sort: string) {
  switch (sort) {
    case "id-desc":
      return Number(b.id) - Number(a.id);
    case "name-asc":
      return String(a.nazwa || "").localeCompare(String(b.nazwa || ""), "pl", { sensitivity: "base" });
    case "name-desc":
      return String(b.nazwa || "").localeCompare(String(a.nazwa || ""), "pl", { sensitivity: "base" });
    case "id-asc":
    default:
      return Number(a.id) - Number(b.id);
  }
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
      deleteAction={deleteCompanyAction}
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
  const filters = {
    q: String(params?.q || "").trim(),
    status: ["active", "inactive"].includes(String(params?.status)) ? String(params.status) : "",
    package: ["free", "standard", "premium"].includes(String(params?.package)) ? String(params.package) : "",
    featured: ["yes", "no"].includes(String(params?.featured)) ? String(params.featured) : "",
    sort: ["id-asc", "id-desc", "name-asc", "name-desc"].includes(String(params?.sort))
      ? String(params.sort)
      : "id-asc",
  };
  const companies = await getAdminCompanies();
  const { pendingCompanies, filteredCompanies } = buildDisplayCompanies(companies, filters);
  const activeFilterCount = [filters.q, filters.status, filters.package, filters.featured].filter(Boolean).length +
    (filters.sort !== "id-asc" ? 1 : 0);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>Firmy</h1>

          <Link href="/admin/firmy/nowa" className={styles.addBtn}>
            Dodaj firmę
          </Link>
        </div>

        {pendingCompanies.length > 0 && (
          <div className={styles.pendingBox}>
            <strong>Nowe zgłoszenia do akceptacji:</strong> {pendingCompanies.length}. Firmy oczekujące są zawsze widoczne na górze listy.
          </div>
        )}

        <form className={styles.filters}>
          <div className={styles.filterField}>
            <label htmlFor="q">Szukaj firmy</label>
            <input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Nazwa, email, WWW lub ID" />
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
            <label htmlFor="featured">Featured</label>
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
            </select>
          </div>

          <div className={styles.filterActions}>
            <button type="submit" className={styles.filterBtn}>Filtruj</button>
            {activeFilterCount > 0 && (
              <Link href="/admin/firmy" className={styles.clearFiltersBtn}>Wyczyść</Link>
            )}
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
                <th>Nazwa</th>
                <th>Email</th>
                <th>WWW</th>
                <th>Pakiet</th>
                <th>Featured</th>
                <th>Leady / miesiąc</th>
                <th>Status</th>
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company: AdminCompany) => (
                <tr key={company.id} className={!company.isActive ? styles.pendingRow : undefined}>
                  <td>{company.id}</td>
                  <td>{company.nazwa || "-"}</td>
                  <td>{company.email || "-"}</td>
                  <td>
                    {company.www ? (
                      <a href={company.www} target="_blank" rel="noreferrer" className={styles.link}>
                        {company.www}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{getPackageLabel(company.packageType)}</td>
                  <td>{getFeaturedLabel(company.featured)}</td>
                  <td>{getLeadUsageLabel(company.monthlyInquiryCount, company.monthlyInquiryLimit)}</td>
                  <td>{getStatusLabel(company.isActive)}</td>
                  <td>{renderCompanyActions(company)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.cards}>
          {filteredCompanies.map((company: AdminCompany) => (
            <div key={company.id} className={`${styles.card} ${!company.isActive ? styles.pendingCard : ""}`}>
              <div className={styles.cardTitle}>{company.nazwa || "-"}</div>
              <div className={styles.cardRow}><span className={styles.label}>ID:</span> {company.id}</div>
              <div className={styles.cardRow}><span className={styles.label}>Email:</span> {company.email || "-"}</div>
              <div className={styles.cardRow}>
                <span className={styles.label}>WWW:</span>{" "}
                {company.www ? <a href={company.www} target="_blank" rel="noreferrer" className={styles.link}>{company.www}</a> : "-"}
              </div>
              <div className={styles.cardRow}><span className={styles.label}>Pakiet:</span> {getPackageLabel(company.packageType)}</div>
              <div className={styles.cardRow}><span className={styles.label}>Featured:</span> {getFeaturedLabel(company.featured)}</div>
              <div className={styles.cardRow}><span className={styles.label}>Leady / miesiąc:</span> {getLeadUsageLabel(company.monthlyInquiryCount, company.monthlyInquiryLimit)}</div>
              <div className={styles.cardRow}><span className={styles.label}>Status:</span> {getStatusLabel(company.isActive)}</div>
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
