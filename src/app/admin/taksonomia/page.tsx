import Link from "next/link";
import {
  getTaxonomyCleanupDashboard,
  getTaxonomyDictionarySummary,
} from "@/lib/taxonomyCleanupActions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function formatNumber(value: number) {
  return new Intl.NumberFormat("pl-PL").format(value);
}

function formatPercent(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function getCoveragePercent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function getPackageLabel(value: string) {
  if (value === "premium") return "Premium";
  if (value === "standard") return "Standard";
  return "Free";
}

export default async function AdminTaxonomyCleanupPage() {
  const [dashboard, dictionary] = await Promise.all([
    getTaxonomyCleanupDashboard(),
    getTaxonomyDictionarySummary(),
  ]);

  const total = dashboard.summary.totalCompanies;
  const metricCards = [
    {
      label: "Typ firmy",
      value: dashboard.summary.typedCompanies,
      percent: getCoveragePercent(dashboard.summary.typedCompanies, total),
      hint: "firmy z przypisanym typem",
    },
    {
      label: "Usługi",
      value: dashboard.summary.companiesWithServices,
      percent: getCoveragePercent(dashboard.summary.companiesWithServices, total),
      hint: "firmy z usługami",
    },
    {
      label: "Możliwości",
      value: dashboard.summary.companiesWithCapabilities,
      percent: getCoveragePercent(dashboard.summary.companiesWithCapabilities, total),
      hint: "firmy z technologiami i procesami",
    },
    {
      label: "Branże",
      value: dashboard.summary.companiesWithIndustries,
      percent: getCoveragePercent(dashboard.summary.companiesWithIndustries, total),
      hint: "firmy z segmentami rynku",
    },
    {
      label: "Certyfikaty",
      value: dashboard.summary.companiesWithCertifications,
      percent: getCoveragePercent(dashboard.summary.companiesWithCertifications, total),
      hint: "firmy z normami i standardami",
    },
    {
      label: "Skala produkcji",
      value: dashboard.summary.companiesWithProductionScale,
      percent: getCoveragePercent(dashboard.summary.companiesWithProductionScale, total),
      hint: "firmy z zakresem produkcji",
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <Link href="/admin" className={styles.backLink}>← Panel admina</Link>
          <Link href="/admin/firmy" className={styles.secondaryLink}>Lista firm</Link>
        </div>

        <section className={styles.hero}>
          <p className={styles.eyebrow}>Etap 6B</p>
          <h1>Cleanup taksonomii dostawców</h1>
          <p>
            To jest robocza lista jakości danych. Najpierw uzupełniamy firmy, które mają najmniej danych w nowym modelu,
            a dopiero później rozbudowujemy matchmaking i kolejne strony segmentów SEO.
          </p>
        </section>

        <section className={styles.summaryGrid} aria-label="Pokrycie danych taksonomii">
          <article className={styles.summaryCard}>
            <span>Aktywne firmy</span>
            <strong>{formatNumber(total)}</strong>
            <small>profile widoczne publicznie</small>
          </article>
          <article className={styles.summaryCard}>
            <span>Pełne profile</span>
            <strong>{formatNumber(dashboard.summary.completeCompanies)}</strong>
            <small>mają wszystkie sekcje taksonomii</small>
          </article>
          <article className={styles.summaryCard}>
            <span>Słowniki</span>
            <strong>{formatNumber(dictionary.services + dictionary.capabilities + dictionary.industries + dictionary.certifications)}</strong>
            <small>aktywnych pozycji w usługach, możliwościach, branżach i certyfikatach</small>
          </article>
        </section>

        <section className={styles.coverageGrid} aria-label="Pokrycie sekcji">
          {metricCards.map((card) => (
            <article key={card.label} className={styles.coverageCard}>
              <div className={styles.coverageHeader}>
                <strong>{card.label}</strong>
                <span>{formatPercent(card.percent)}</span>
              </div>
              <div className={styles.progressTrack} aria-hidden="true">
                <div className={styles.progressFill} style={{ width: formatPercent(card.percent) }} />
              </div>
              <p>{formatNumber(card.value)} / {formatNumber(total)} — {card.hint}</p>
            </article>
          ))}
        </section>

        <section className={styles.workflowCard}>
          <div>
            <p className={styles.sectionKicker}>Kolejność pracy</p>
            <h2>Jak teraz uzupełniać firmy</h2>
          </div>
          <ol>
            <li>Otwórz firmę z listy priorytetowej.</li>
            <li>Uzupełnij typ firmy, usługi i skalę produkcji.</li>
            <li>Dopiero po potwierdzeniu dodawaj branże, możliwości i certyfikaty.</li>
            <li>Nie zgaduj certyfikatów — wpisuj tylko te, które są jasno potwierdzone.</li>
          </ol>
        </section>

        <section className={styles.tableCard}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionKicker}>Priorytet uzupełniania</p>
              <h2>Firmy z brakującymi sekcjami</h2>
            </div>
            <span>{formatNumber(dashboard.priorityCompanies.length)} pokazanych</span>
          </div>

          {dashboard.priorityCompanies.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Firma</th>
                    <th>Pakiet</th>
                    <th>Typ</th>
                    <th>Region</th>
                    <th>Kompletność</th>
                    <th>Braki</th>
                    <th>Akcja</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.priorityCompanies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <strong>{company.nazwa}</strong>
                        <small>ID: {company.id}</small>
                      </td>
                      <td>{getPackageLabel(company.packageType)}</td>
                      <td>{company.companyTypeLabel}</td>
                      <td>{company.wojewodztwo}</td>
                      <td>
                        <span className={styles.score}>{formatPercent(company.completionScore)}</span>
                      </td>
                      <td>
                        <div className={styles.missingTags}>
                          {company.missingSections.map((section) => (
                            <span key={section}>{section}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <Link href={company.editHref} className={styles.editLink}>Edytuj</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.emptyState}>Wszystkie aktywne firmy mają komplet podstawowych sekcji taksonomii.</p>
          )}
        </section>
      </div>
    </main>
  );
}
