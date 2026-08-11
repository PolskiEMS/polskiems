import { and, asc, eq, sql } from 'drizzle-orm';
import Link from 'next/link';
import { producenci } from '@/db/schema';
import { getDb } from '@/lib/db';
import { sendInquiryAction } from '@/lib/actions';
import styles from './style.module.css';
import { SERVICES } from '@/lib/services';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{
    companyId?: string;
    source?: string;
    success?: string;
    error?: string;
  }>;
};

function normalizeSource(source?: string) {
  if (source === 'company_card' || source === 'company_profile') return source;
  return 'global_form';
}

function getErrorCopy(error?: string) {
  switch (error) {
    case 'missing':
      return 'Uzupełnij wszystkie wymagane pola i zaakceptuj zgodę na kontakt.';
    case 'company':
      return 'Nie udało się znaleźć aktywnych firm EMS z adresem e-mail dla tego zapytania. Zmień zakres usług albo skontaktuj się z PolskiEMS.';
    case 'file':
      return 'Załącznik jest za duży. Maksymalny rozmiar pliku dokumentacji to 5 MB.';
    default:
      return null;
  }
}

export default async function InquiryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const companyId = Number(params.companyId ?? 0);
  const source = normalizeSource(params.source);
  const success = params.success === '1';
  const errorCopy = getErrorCopy(params.error);
  let databaseUnavailable = false;
  let activeCompanies: Array<{ id: number; nazwa: string }> = [];
  try {
    const db = getDb();
    activeCompanies = await db
      .select({ id: producenci.id, nazwa: producenci.nazwa })
      .from(producenci)
      .where(and(eq(producenci.isActive, true), sql`TRIM(${producenci.email}) <> ''`))
      .orderBy(asc(producenci.nazwa));
  } catch {
    databaseUnavailable = true;
    console.error("Inquiry company list query failed");
  }

  let company: { id: number; nazwa: string } | null = null;

  if (Number.isFinite(companyId) && companyId > 0) company = activeCompanies.find((item) => item.id === companyId) ?? null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Zapytanie ofertowe</h1>
        <p className={styles.lead}>
          Uzupełnij potrzeby projektu w formularzu. Możesz wskazać konkretną firmę EMS albo zostawić
          dopasowanie PolskiEMS — wtedy dobierzemy 3–5 najlepiej pasujących firm, zweryfikujemy
          zapytanie po stronie administratora i przekażemy je dalej.
        </p>
        {databaseUnavailable && <div role="alert" className={styles.errorBox}>Lista firm jest chwilowo niedostępna. Formularz globalny nadal możesz wypełnić; spróbuj ponownie później, jeśli chcesz wskazać konkretną firmę.</div>}

        <section className={styles.processBox} aria-label="Jak obsługujemy zapytanie ofertowe">
          <h2>Jak obsługujemy zapytanie?</h2>
          <ol>
            <li>Klient opisuje potrzeby, technologię, skalę i termin realizacji.</li>
            <li>PolskiEMS dopasowuje zapytanie do 3–5 najlepiej pasujących firm EMS.</li>
            <li>Administrator weryfikuje kompletność i jakość zapytania.</li>
            <li>Po akceptacji zapytanie trafia do wybranych firm, które mogą przygotować kontakt lub ofertę.</li>
          </ol>
        </section>

        {success && (
          <div className={styles.successBox}>
            Dziękujemy. Twoje zapytanie zostało przekazane do weryfikacji. Po akceptacji trafi do wybranej lub dopasowanej grupy firm EMS.
          </div>
        )}

        {errorCopy && (
          <div className={styles.errorBox}>{errorCopy}</div>
        )}

        <form action={sendInquiryAction} className={styles.form} encType="multipart/form-data">
          <input type="hidden" name="source" value={source} />

          <div className={styles.field}>
            <label htmlFor="company">Preferowana firma EMS</label>
            <select
              id="company"
              name="companyId"
              className={`${styles.input} ${styles.select}`}
              defaultValue={company?.id ? String(company.id) : ''}
            >
              <option value="">Dopasuj automatycznie 3–5 najlepiej pasujących firm</option>
              {activeCompanies.map((activeCompany) => (
                <option key={activeCompany.id} value={activeCompany.id}>
                  {activeCompany.nazwa}
                </option>
              ))}
            </select>
            <small>Jeśli nie wybierzesz firmy, PolskiEMS dobierze najlepsze firmy na podstawie usług i opisu projektu.</small>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.field}>
              <label htmlFor="customerName">Imię i nazwisko klienta *</label>
              <input id="customerName" name="customerName" className={styles.input} required />
            </div>

            <div className={styles.field}>
              <label htmlFor="customerCompany">Nazwa firmy klienta</label>
              <input id="customerCompany" name="customerCompany" className={styles.input} />
            </div>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.field}>
              <label htmlFor="customerEmail">E-mail *</label>
              <input id="customerEmail" name="customerEmail" type="email" className={styles.input} required />
            </div>

            <div className={styles.field}>
              <label htmlFor="customerPhone">Telefon</label>
              <input id="customerPhone" name="customerPhone" className={styles.input} />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="serviceTypes">Typ usługi *</label>
            <select
              id="serviceTypes"
              name="serviceTypes"
              className={styles.select}
              multiple
              size={Math.min(SERVICES.length, 8)}
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

          <div className={styles.gridTwo}>
            <div className={styles.field}>
              <label htmlFor="quantity">Liczba sztuk / skala produkcji *</label>
              <input id="quantity" name="quantity" className={styles.input} placeholder="np. 500 szt., prototyp + seria" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="deadline">Termin realizacji *</label>
              <input id="deadline" name="deadline" className={styles.input} placeholder="np. do końca Q3 / 6 tygodni" required />
            </div>
          </div>

          <section className={styles.documentationBox}>
            <fieldset className={styles.fieldset}>
              <legend>Czy posiadasz dokumentację techniczną? *</legend>
              <label className={styles.radioLabel}>
                <input type="radio" name="hasDocumentation" value="yes" required />
                <span>Tak — chcę załączyć pliki do weryfikacji</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="hasDocumentation" value="no" required />
                <span>Nie / dokumentacja jest w przygotowaniu</span>
              </label>
            </fieldset>

            <div className={styles.field}>
              <label htmlFor="documentationFile">Załącz dokumentację techniczną</label>
              <input
                id="documentationFile"
                name="documentationFile"
                type="file"
                className={styles.fileInput}
                accept=".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.ger,.gbr,.brd,.pcb"
              />
              <small>Opcjonalnie: BOM, gerbery, PCB, rysunki, wymagania testowe lub paczka ZIP/RAR. Maksymalnie 5 MB.</small>
            </div>
          </section>

          <div className={styles.field}>
            <label htmlFor="message">Opis projektu *</label>
            <textarea
              id="message"
              name="message"
              className={styles.textarea}
              required
              placeholder="Opisz projekt, technologię, wymagania jakościowe, oczekiwane testy, BOM/PCB/gerbery oraz istotne ograniczenia."
            />
          </div>

          <label className={styles.consentLabel}>
            <input type="checkbox" name="rodoConsent" required />
            Wyrażam zgodę na kontakt w sprawie zapytania ofertowego oraz przekazanie danych do wybranej lub dopasowanej grupy firm EMS po weryfikacji przez PolskiEMS.
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.submitBtn}>Wyślij zapytanie do weryfikacji</button>
          </div>
        </form>

        <div className={styles.actions}>
          <Link href="/producenci" className={styles.secondaryBtn}>Wróć do producentów</Link>
        </div>
      </div>
    </div>
  );
}
