import { getCompanyReport, getReportCompanies } from "@/lib/actions";
import styles from "./style.module.css";
import Link from "next/link";
import ReportFilters from "./ReportFilters";

export const dynamic = "force-dynamic";

const PRESET_DAYS = [7, 30, 90] as const;
const isValidDate = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
const isStartAfterEnd = (start: string, end: string) => start > end;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; days?: string; startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;
  const companyId = Number(params?.companyId ?? 0);
  const parsedDays = Number(params?.days ?? 30);
  const days = PRESET_DAYS.includes(parsedDays as (typeof PRESET_DAYS)[number]) ? parsedDays : 30;

  const startDate = isValidDate(params?.startDate) ? String(params?.startDate) : "";
  const endDate = isValidDate(params?.endDate) ? String(params?.endDate) : "";
  const useCustomRange = Boolean(startDate && endDate);
  const invalidCustomRange = useCustomRange && isStartAfterEnd(startDate, endDate);

  const companies = await getReportCompanies();

  let report = null;
  if (companyId > 0 && !invalidCustomRange) {
    report = await getCompanyReport(
      companyId,
      useCustomRange ? null : days,
      useCustomRange ? startDate : null,
      useCustomRange ? endDate : null
    );
  }

  const rangeLabel = useCustomRange ? `${startDate} – ${endDate}` : `${days} dni`;
  const queryRange = useCustomRange ? `startDate=${startDate}&endDate=${endDate}` : `days=${days}`;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Raporty</h1>

        <ReportFilters
          companies={companies}
          selectedCompanyId={companyId}
          selectedDays={days}
          startDate={startDate}
          endDate={endDate}
          rangeMode={useCustomRange ? "custom" : "preset"}
        />

        {invalidCustomRange ? <p className={styles.error}>Data od nie może być późniejsza niż Data do.</p> : null}

        {report ? (
          <div className={styles.reportCard}>
            <h2 className={styles.reportTitle}>{report.firma} — raport ({rangeLabel})</h2>

            <div className={styles.kpis}>
              <div className={styles.kpi}><span className={styles.kpiLabel}>Wyświetlenia</span><strong className={styles.kpiValue}>{report.views}</strong></div>
              <div className={styles.kpi}><span className={styles.kpiLabel}>Klik WWW</span><strong className={styles.kpiValue}>{report.websiteClicks}</strong></div>
              <div className={styles.kpi}><span className={styles.kpiLabel}>Klik Email</span><strong className={styles.kpiValue}>{report.emailClicks}</strong></div>
              <div className={styles.kpi}><span className={styles.kpiLabel}>CTR WWW</span><strong className={styles.kpiValue}>{report.websiteCtrPct}%</strong></div>
              <div className={styles.kpi}><span className={styles.kpiLabel}>CTR Email</span><strong className={styles.kpiValue}>{report.emailCtrPct}%</strong></div>
              <div className={styles.kpi}><span className={styles.kpiLabel}>RFQ przekazane</span><strong className={styles.kpiValue}>{report.inquiriesCount}</strong></div>
            </div>

            <div className={styles.actionsRow}>
              <a href={`/admin/raporty/pdf?companyId=${companyId}&${queryRange}`} className={styles.pdfButton}>Pobierz PDF</a>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>Wybierz firmę i zakres, aby wyświetlić raport.</div>
        )}

        <div className={styles.backRow}>
          <Link href="/admin" className={styles.backLink}>← Powrót do panelu</Link>
        </div>
      </div>
    </div>
  );
}
