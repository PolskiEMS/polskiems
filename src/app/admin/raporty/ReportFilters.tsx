"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./style.module.css";

type Company = { id: number; nazwa: string };
type RangeMode = "preset" | "custom";

const PRESET_DAYS = [7, 30, 90] as const;

const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isStartAfterEnd = (start: string, end: string) => start > end;

export default function ReportFilters({
  companies,
  selectedCompanyId,
  selectedDays,
  startDate,
  endDate,
  rangeMode,
}: {
  companies: Company[];
  selectedCompanyId: number;
  selectedDays: number;
  startDate: string;
  endDate: string;
  rangeMode: RangeMode;
}) {
  const router = useRouter();
  const [companyId, setCompanyId] = useState(String(selectedCompanyId || ""));
  const [mode, setMode] = useState<RangeMode>(rangeMode);
  const [days, setDays] = useState(String(selectedDays));
  const [dateFrom, setDateFrom] = useState(startDate);
  const [dateTo, setDateTo] = useState(endDate);
  const [error, setError] = useState("");

  const isCustom = mode === "custom";

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (companyId) params.set("companyId", companyId);
    if (isCustom) {
      if (dateFrom) params.set("startDate", dateFrom);
      if (dateTo) params.set("endDate", dateTo);
    } else {
      params.set("days", days);
    }
    return params.toString();
  }, [companyId, isCustom, dateFrom, dateTo, days]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isCustom) {
      if (!isIsoDate(dateFrom) || !isIsoDate(dateTo)) {
        setError("Wybierz poprawne daty w formacie RRRR-MM-DD.");
        return;
      }
      if (isStartAfterEnd(dateFrom, dateTo)) {
        setError("Data od nie może być późniejsza niż Data do.");
        return;
      }
    } else if (!PRESET_DAYS.includes(Number(days) as (typeof PRESET_DAYS)[number])) {
      setError("Wybierz poprawny gotowy zakres: 7, 30 lub 90 dni.");
      return;
    }

    router.push(`/admin/raporty${queryString ? `?${queryString}` : ""}`);
  };

  const onModeChange = (newMode: RangeMode) => {
    setMode(newMode);
    setError("");
    if (newMode === "preset") {
      setDateFrom("");
      setDateTo("");
    }
  };

  return (
    <form className={styles.filters} onSubmit={onSubmit}>
      <div className={styles.field}>
        <label htmlFor="companyId">Firma</label>
        <select id="companyId" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={styles.select}>
          <option value="">Wybierz firmę</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>{company.nazwa}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="rangeMode">Tryb zakresu</label>
        <select id="rangeMode" value={mode} onChange={(e) => onModeChange(e.target.value as RangeMode)} className={styles.select}>
          <option value="preset">Gotowy zakres</option>
          <option value="custom">Własny zakres dat</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="days">Gotowy zakres</label>
        <select id="days" value={days} onChange={(e) => setDays(e.target.value)} className={styles.select} disabled={isCustom}>
          <option value="7">7 dni</option>
          <option value="30">30 dni</option>
          <option value="90">90 dni</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="startDate">Data od</label>
        <input id="startDate" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={styles.select} disabled={!isCustom} />
      </div>

      <div className={styles.field}>
        <label htmlFor="endDate">Data do</label>
        <input id="endDate" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={styles.select} disabled={!isCustom} />
      </div>

      <button type="submit" className={styles.button}>Pokaż raport</button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </form>
  );
}
