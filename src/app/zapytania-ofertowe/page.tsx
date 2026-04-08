import { and, asc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { producenci } from '@/db/schema';
import { getDb } from '@/lib/db';
import { sendInquiryAction } from '@/lib/actions';
import styles from './style.module.css';
import { SERVICES } from "@/lib/services";

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{
    companyId?: string;
    success?: string;
  }>;
};

export default async function InquiryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const companyId = Number(params.companyId ?? 0);
  const success = params.success === '1';
  const db = getDb();

  const activeCompanies = await db
    .select({
      id: producenci.id,
      nazwa: producenci.nazwa,
    })
    .from(producenci)
    .where(eq(producenci.isActive, true))
    .orderBy(asc(producenci.nazwa));

  let company: { id: number; nazwa: string } | null = null;

  if (Number.isFinite(companyId) && companyId > 0) {
    const rows = await db
      .select({
        id: producenci.id,
        nazwa: producenci.nazwa,
      })
      .from(producenci)
      .where(and(eq(producenci.id, companyId), eq(producenci.isActive, true)))
      .limit(1);

    company = rows[0] ?? null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Zapytanie ofertowe</h1>

        {success && (
          <div className={styles.successBox}>
            Dziękujemy. Twoje zapytanie zostało zapisane.
          </div>
        )}

        <form action={sendInquiryAction} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="company">Firma</label>
            <select
              id="company"
              name="companyId"
              className={styles.input}
              defaultValue={company?.id ? String(company.id) : ''}
              required
            >
              <option value="" disabled>Wybierz firmę</option>
              {activeCompanies.map((activeCompany) => (
                <option key={activeCompany.id} value={activeCompany.id}>
                  {activeCompany.nazwa}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="customerName">Imię i nazwisko *</label>
            <input id="customerName" name="customerName" className={styles.input} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="customerCompany">Firma</label>
            <input id="customerCompany" name="customerCompany" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label htmlFor="customerEmail">E-mail *</label>
            <input id="customerEmail" name="customerEmail" type="email" className={styles.input} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="customerPhone">Telefon</label>
            <input id="customerPhone" name="customerPhone" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label htmlFor="serviceTypes">Usługi *</label>
            <select
              id="serviceTypes"
              name="serviceTypes"
              className={styles.select}
              multiple
              size={SERVICES.length}
              required
              defaultValue={[]}
            >
              {SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            <small>Przytrzymaj Ctrl (Windows) lub Cmd (Mac), aby zaznaczyć wiele usług.</small>
          </div>

          <div className={styles.field}>
            <label htmlFor="quantity">Ilość</label>
            <input id="quantity" name="quantity" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label htmlFor="deadline">Termin realizacji</label>
            <input id="deadline" name="deadline" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label htmlFor="message">Opis projektu *</label>
            <textarea
              id="message"
              name="message"
              className={styles.textarea}
              required
              placeholder="Opisz krótko projekt, wymagania, technologię, dokumentację itp."
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.submitBtn}>Wyślij zapytanie</button>
          </div>
        </form>

        <div className={styles.actions}>
          <Link href="/producenci" className={styles.submitBtn}>Wróć do producentów</Link>
        </div>
      </div>
    </div>
  );
}
