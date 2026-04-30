import { getCompanyReport, getReportCompanies } from "@/lib/actions";
import styles from "./style.module.css";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PRESET_DAYS = [7, 30, 90, 180, 365] as const;

const isValidDate = (value?: string) =>
  Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; days?: string; startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;
  const daysRaw = Number(params?.days ?? 30);
  const days = PRESET_DAYS.includes(daysRaw as (typeof PRESET_DAYS)[number]) ? daysRaw : 30;
  const companyId = Number(params?.companyId ?? 0);
  const startDate = isValidDate(params?.startDate) ? String(params?.startDate) : "";
  const endDate = isValidDate(params?.endDate) ? String(params?.endDate) : "";
  const useCustomRange = Boolean(startDate && endDate);

  const companies = await getReportCompanies();
  const report =
    companyId > 0
      ? await getCompanyReport(companyId, days, startDate || null, endDate || null)
      : null;

  const rangeLabel = useCustomRange
    ? `${startDate} – ${endDate}`
    : `${days} dni`;

  const queryRange = useCustomRange
    ? `startDate=${startDate}&endDate=${endDate}`
    : `days=${days}`;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Raporty</h1>

        <form className={styles.filters} method="GET">
          <div className={styles.field}>
            <label htmlFor="companyId">Firma</label>
            <select
              id="companyId"
              name="companyId"
              defaultValue={companyId || ""}
              className={styles.select}
            >
              <option value="">Wybierz firmę</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.nazwa}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="days">Gotowy zakres</label>
            <select
              id="days"
              name="days"
              defaultValue={days}
              className={styles.select}
            >
              <option value="7">7 dni</option>
              <option value="30">30 dni</option>
              <option value="90">90 dni</option>
              <option value="180">180 dni</option>
              <option value="365">365 dni</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="startDate">Data od</label>
            <input id="startDate" name="startDate" type="date" defaultValue={startDate} className={styles.select} />
          </div>

          <div className={styles.field}>
            <label htmlFor="endDate">Data do</label>
            <input id="endDate" name="endDate" type="date" defaultValue={endDate} className={styles.select} />
          </div>

          <button type="submit" className={styles.button}>
            Pokaż raport
          </button>
        </form>

        {report ? (
          <div className={styles.reportCard}>
            <h2 className={styles.reportTitle}>
              {report.firma} — raport ({rangeLabel})
            </h2>

            <div className={styles.kpis}>
              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>Wyświetlenia</span>
                <strong className={styles.kpiValue}>{report.views}</strong>
              </div>

              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>Klik WWW</span>
                <strong className={styles.kpiValue}>{report.websiteClicks}</strong>
              </div>

              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>Klik Email</span>
                <strong className={styles.kpiValue}>{report.emailClicks}</strong>
              </div>

              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>CTR WWW</span>
                <strong className={styles.kpiValue}>{report.websiteCtrPct}%</strong>
              </div>

              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>CTR Email</span>
                <strong className={styles.kpiValue}>{report.emailCtrPct}%</strong>
              </div>
            </div>

            <div className={styles.actionsRow}>
              <a
                href={`/admin/raporty/pdf?companyId=${companyId}&${queryRange}`}
                className={styles.pdfButton}
              >
                Pobierz PDF
              </a>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            Wybierz firmę i zakres dni, aby wyświetlić raport.
          </div>
        )}

        <div className={styles.backRow}>
          <Link href="/admin" className={styles.backLink}>
            ← Powrót do panelu
          </Link>
        </div>
      </div>
    </div>
  );
}
