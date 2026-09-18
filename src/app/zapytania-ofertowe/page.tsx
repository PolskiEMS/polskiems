import { and, asc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import {
  capabilities,
  certifications,
  industries,
  producenci,
  produkcja,
  services,
  wojewodztwa,
} from "@/db/schema";
import { getDb } from "@/lib/db";
import { sendInquiryAction } from "@/lib/actions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    companyId?: string;
    source?: string;
    success?: string;
    error?: string;
  }>;
};

function normalizeSource(source?: string) {
  if (source === "company_card" || source === "company_profile") return source;
  return "global_form";
}

function getErrorCopy(error?: string) {
  switch (error) {
    case "missing":
      return "Uzupełnij wymagane dane projektu, wybierz co najmniej jedną usługę i zaakceptuj zgodę na przekazanie zapytania.";
    case "company":
      return "Nie udało się znaleźć aktywnej firmy z adresem e-mail dla wybranego trybu. Wybierz inną firmę albo użyj automatycznego dopasowania.";
    case "file":
      return "Załącznik jest za duży. Maksymalny rozmiar pliku dokumentacji to 5 MB.";
    default:
      return null;
  }
}

type Option = { id: number; label: string; value: string };

function CheckboxGroup({
  title,
  description,
  name,
  options,
}: {
  title: string;
  description: string;
  name: string;
  options: Option[];
}) {
  return (
    <fieldset className={styles.taxonomyGroup}>
      <legend>{title}</legend>
      <p className={styles.groupHelp}>{description}</p>
      <div className={styles.checkboxGrid}>
        {options.map((option) => (
          <label key={option.value} className={styles.checkboxOption}>
            <input type="checkbox" name={name} value={option.value} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default async function InquiryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const companyId = Number(params.companyId ?? 0);
  const source = normalizeSource(params.source);
  const success = params.success === "1";
  const errorCopy = getErrorCopy(params.error);

  let databaseUnavailable = false;
  let activeCompanies: Array<{ id: number; nazwa: string }> = [];
  let serviceOptions: Option[] = [];
  let capabilityOptions: Option[] = [];
  let industryOptions: Option[] = [];
  let certificationOptions: Option[] = [];
  let productionOptions: Option[] = [];
  let regionOptions: Option[] = [];

  try {
    const db = getDb();
    const [
      companiesRows,
      servicesRows,
      capabilitiesRows,
      industriesRows,
      certificationsRows,
      productionRows,
      regionsRows,
    ] = await Promise.all([
      db
        .select({ id: producenci.id, nazwa: producenci.nazwa })
        .from(producenci)
        .where(and(eq(producenci.isActive, true), sql`TRIM(${producenci.email}) <> ''`))
        .orderBy(asc(producenci.nazwa)),
      db
        .select({ id: services.id, slug: services.slug, name: services.name })
        .from(services)
        .where(eq(services.isActive, true))
        .orderBy(asc(services.sortOrder), asc(services.name)),
      db
        .select({ id: capabilities.id, slug: capabilities.slug, name: capabilities.name })
        .from(capabilities)
        .where(eq(capabilities.isActive, true))
        .orderBy(asc(capabilities.sortOrder), asc(capabilities.name)),
      db
        .select({ id: industries.id, slug: industries.slug, name: industries.name })
        .from(industries)
        .where(eq(industries.isActive, true))
        .orderBy(asc(industries.sortOrder), asc(industries.name)),
      db
        .select({ id: certifications.id, code: certifications.code, name: certifications.name })
        .from(certifications)
        .where(eq(certifications.isActive, true))
        .orderBy(asc(certifications.sortOrder), asc(certifications.name)),
      db
        .select({ id: produkcja.id, zakres: produkcja.zakres })
        .from(produkcja)
        .orderBy(asc(produkcja.sortOrder), asc(produkcja.zakres)),
      db
        .select({ id: wojewodztwa.id, nazwa: wojewodztwa.nazwa })
        .from(wojewodztwa)
        .orderBy(asc(wojewodztwa.nazwa)),
    ]);

    activeCompanies = companiesRows;
    serviceOptions = servicesRows.map((item) => ({ id: item.id, value: item.slug, label: item.name }));
    capabilityOptions = capabilitiesRows.map((item) => ({ id: item.id, value: item.slug, label: item.name }));
    industryOptions = industriesRows.map((item) => ({ id: item.id, value: item.slug, label: item.name }));
    certificationOptions = certificationsRows.map((item) => ({ id: item.id, value: item.code, label: item.name }));
    productionOptions = productionRows.map((item) => ({ id: item.id, value: String(item.id), label: item.zakres }));
    regionOptions = regionsRows.map((item) => ({ id: item.id, value: String(item.id), label: item.nazwa }));
  } catch {
    databaseUnavailable = true;
    console.error("Inquiry taxonomy query failed");
  }

  const selectedCompany =
    Number.isFinite(companyId) && companyId > 0
      ? activeCompanies.find((item) => item.id === companyId) ?? null
      : null;
  const defaultMode = selectedCompany ? "selected_company" : "auto_match";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <span className={styles.eyebrow}>RFQ · zapytanie ofertowe</span>
          <h1 className={styles.title}>Znajdź producenta dopasowanego do projektu</h1>
          <p className={styles.lead}>
            Wskaż konkretną firmę albo zostaw dobór PolskiEMS. W trybie automatycznym system wykorzysta
            usługi, możliwości technologiczne, branżę, certyfikaty, skalę produkcji i lokalizację,
            aby przygotować grupę najlepiej pasujących producentów do weryfikacji przez administratora.
          </p>
        </div>

        {databaseUnavailable && (
          <div role="alert" className={styles.errorBox}>
            Dane formularza są chwilowo niedostępne. Odśwież stronę za chwilę.
          </div>
        )}

        <section className={styles.processBox} aria-label="Jak obsługujemy zapytanie ofertowe">
          <h2>Jak działa zapytanie?</h2>
          <ol>
            <li>Opisujesz projekt i zaznaczasz wymagania techniczne.</li>
            <li>Wybierasz konkretną firmę albo automatyczne dopasowanie PolskiEMS.</li>
            <li>System przygotowuje kandydatów na podstawie danych producentów w bazie.</li>
            <li>Administrator sprawdza zapytanie przed przekazaniem go do wybranych firm.</li>
          </ol>
        </section>

        {success && (
          <div className={styles.successBox}>
            Dziękujemy. Zapytanie zostało zapisane i czeka na weryfikację. Nie jest wysyłane do producentów bez sprawdzenia po stronie PolskiEMS.
          </div>
        )}

        {errorCopy && <div className={styles.errorBox}>{errorCopy}</div>}

        <form action={sendInquiryAction} className={styles.form} encType="multipart/form-data">
          <input type="hidden" name="source" value={source} />

          <section className={styles.formSection}>
            <div className={styles.sectionHeading}>
              <span>1</span>
              <div>
                <h2>Sposób dopasowania</h2>
                <p>Wybierz, czy zapytanie ma dotyczyć jednej firmy, czy ma zostać dopasowane automatycznie.</p>
              </div>
            </div>

            <fieldset className={styles.modeGrid}>
              <label className={styles.modeCard}>
                <input
                  type="radio"
                  name="matchingMode"
                  value="auto_match"
                  defaultChecked={defaultMode === "auto_match"}
                />
                <span>
                  <strong>Dopasuj automatycznie</strong>
                  <small>PolskiEMS przygotuje 3–5 najlepiej pasujących firm do weryfikacji przez administratora.</small>
                </span>
              </label>

              <label className={styles.modeCard}>
                <input
                  type="radio"
                  name="matchingMode"
                  value="selected_company"
                  defaultChecked={defaultMode === "selected_company"}
                />
                <span>
                  <strong>Wskaż konkretną firmę</strong>
                  <small>Zapytanie zostanie przypisane do wybranego producenta i trafi do niego po akceptacji.</small>
                </span>
              </label>
            </fieldset>

            <div className={styles.field}>
              <label htmlFor="companyId">Preferowana firma</label>
              <select
                id="companyId"
                name="companyId"
                className={styles.select}
                defaultValue={selectedCompany?.id ? String(selectedCompany.id) : ""}
              >
                <option value="">Nie wskazuję firmy — użyj automatycznego dopasowania</option>
                {activeCompanies.map((activeCompany) => (
                  <option key={activeCompany.id} value={activeCompany.id}>
                    {activeCompany.nazwa}
                  </option>
                ))}
              </select>
              <small>Jeżeli wybierzesz tryb „Wskaż konkretną firmę”, wybierz ją z listy.</small>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeading}>
              <span>2</span>
              <div>
                <h2>Dane kontaktowe</h2>
                <p>Dane potrzebne do obsługi zapytania i kontaktu w sprawie projektu.</p>
              </div>
            </div>

            <div className={styles.gridTwo}>
              <div className={styles.field}>
                <label htmlFor="customerName">Imię i nazwisko *</label>
                <input id="customerName" name="customerName" className={styles.input} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="customerCompany">Nazwa firmy</label>
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
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeading}>
              <span>3</span>
              <div>
                <h2>Wymagania projektu</h2>
                <p>Usługi są wymagane. Pozostałe kryteria zwiększają dokładność automatycznego dopasowania.</p>
              </div>
            </div>

            <CheckboxGroup
              title="Usługi *"
              description="Zaznacz wszystkie usługi potrzebne w projekcie."
              name="serviceSlugs"
              options={serviceOptions}
            />
            <CheckboxGroup
              title="Możliwości technologiczne"
              description="Np. AOI, X-Ray, BGA, test funkcjonalny, conformal coating."
              name="capabilitySlugs"
              options={capabilityOptions}
            />
            <CheckboxGroup
              title="Branża"
              description="Wskaż branżę końcowego produktu, jeśli ma znaczenie dla projektu."
              name="industrySlugs"
              options={industryOptions}
            />
            <CheckboxGroup
              title="Certyfikaty i standardy"
              description="Zaznacz tylko wymagania rzeczywiście potrzebne w projekcie."
              name="certificationCodes"
              options={certificationOptions}
            />
            <CheckboxGroup
              title="Skala produkcji"
              description="Możesz zaznaczyć kilka zakresów, np. prototypy i późniejszą serię."
              name="productionScaleIds"
              options={productionOptions}
            />
            <CheckboxGroup
              title="Preferowana lokalizacja"
              description="Opcjonalnie wskaż województwa. Brak wyboru oznacza całą Polskę."
              name="preferredRegionIds"
              options={regionOptions}
            />

            <div className={styles.gridTwo}>
              <div className={styles.field}>
                <label htmlFor="quantity">Planowana liczba sztuk *</label>
                <input
                  id="quantity"
                  name="quantity"
                  className={styles.input}
                  placeholder="np. 20 prototypów + 500 szt. serii"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="deadline">Oczekiwany termin *</label>
                <input
                  id="deadline"
                  name="deadline"
                  className={styles.input}
                  placeholder="np. 6 tygodni / do końca Q4"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="message">Opis projektu *</label>
              <textarea
                id="message"
                name="message"
                className={styles.textarea}
                required
                placeholder="Opisz urządzenie lub moduł, etap projektu, technologię, wymagania jakościowe, testy, BOM/PCB/gerbery oraz inne ograniczenia."
              />
            </div>
          </section>

          <section className={styles.documentationBox}>
            <fieldset className={styles.fieldset}>
              <legend>Czy posiadasz dokumentację techniczną? *</legend>
              <label className={styles.radioLabel}>
                <input type="radio" name="hasDocumentation" value="yes" required />
                <span>Tak — mam dokumentację</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="hasDocumentation" value="no" required />
                <span>Nie / jest w przygotowaniu</span>
              </label>
            </fieldset>

            <div className={styles.field}>
              <label htmlFor="documentationFile">Załącz dokumentację</label>
              <input
                id="documentationFile"
                name="documentationFile"
                type="file"
                className={styles.fileInput}
                accept=".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.ger,.gbr,.brd,.pcb"
              />
              <small>Opcjonalnie: BOM, gerbery, PCB, rysunki lub wymagania testowe. Maksymalnie 5 MB.</small>
            </div>
          </section>

          <label className={styles.consentLabel}>
            <input type="checkbox" name="rodoConsent" required />
            <span>
              Wyrażam zgodę na przekazanie danych kontaktowych i treści zapytania wybranej firmie lub
              producentom dopasowanym przez PolskiEMS w celu przygotowania odpowiedzi ofertowej.
            </span>
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.submitBtn} disabled={databaseUnavailable}>
              Wyślij zapytanie do weryfikacji
            </button>
          </div>
        </form>

        <div className={styles.actions}>
          <Link href="/producenci" className={styles.secondaryBtn}>Wróć do producentów</Link>
        </div>
      </div>
    </div>
  );
}
