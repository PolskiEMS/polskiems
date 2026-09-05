import Link from "next/link";
import {
  getAllDzialaniaEms,
  getAllProdukcjaScales,
  getAllRegion,
} from "@/lib/actions";
import {
  createCompanyWithTaxonomyAction,
  getSupplierTaxonomyOptions,
} from "@/lib/adminCompanyTaxonomyActions";
import { COMPANY_TYPE_LABELS } from "@/lib/supplierTaxonomy";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type TaxonomyOption = {
  id: number;
  name: string;
};

function renderOptions(options: TaxonomyOption[], fieldName: string) {
  return options.map((item) => (
    <label key={item.id} className={styles.optionLabel}>
      <input type="checkbox" name={fieldName} value={item.id} />
      <span>{item.name}</span>
    </label>
  ));
}

function EmptyState({ text }: { text: string }) {
  return <p className={styles.emptyState}>{text}</p>;
}

export default async function NewCompanyPage() {
  const dzialania = await getAllDzialaniaEms();
  const produkcja = await getAllProdukcjaScales();
  const regions = await getAllRegion();
  const taxonomyOptions = await getSupplierTaxonomyOptions();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Panel administratora</p>
            <h1 className={styles.title}>Dodaj firmę</h1>
            <p className={styles.subtitle}>
              Dodaj producenta lub dostawcę elektroniki z podziałem na dane podstawowe, pakiet oraz nową taksonomię B2B.
            </p>
          </div>

          <Link href="/admin/firmy" className={styles.backBtn}>
            Powrót do firm
          </Link>
        </div>

        <form action={createCompanyWithTaxonomyAction} className={styles.form}>
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>01</span>
              <div>
                <h2>Dane podstawowe</h2>
                <p>Nazwa, kontakt, lokalizacja i opis profilu.</p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="nazwa">Nazwa firmy</label>
                <input id="nazwa" name="nazwa" type="text" required />
              </div>

              <div className={styles.field}>
                <label htmlFor="telefon">Telefon</label>
                <input id="telefon" name="telefon" type="text" />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" />
              </div>

              <div className={styles.field}>
                <label htmlFor="www">Strona WWW</label>
                <input id="www" name="www" type="text" placeholder="https://..." />
              </div>

              <div className={styles.field}>
                <label htmlFor="wojewodztwoId">Województwo</label>
                <select id="wojewodztwoId" name="wojewodztwoId">
                  <option value="">Wybierz województwo</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>{region.nazwa}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="adres">Adres</label>
                <input id="adres" name="adres" type="text" placeholder="ulica, kod, miasto" />
              </div>
            </div>

            <div className={styles.fieldFull}>
              <label htmlFor="opis">Opis firmy</label>
              <textarea id="opis" name="opis" rows={5} />
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>02</span>
              <div>
                <h2>Typ firmy i widoczność</h2>
                <p>To określa, jak dostawca będzie klasyfikowany w docelowej bazie PolskiEMS.</p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="companyType">Typ firmy</label>
                <select id="companyType" name="companyType" defaultValue="ems">
                  {Object.entries(COMPANY_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="packageType">Pakiet</label>
                <select id="packageType" name="packageType" defaultValue="free">
                  <option value="free">Free</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="isActive" defaultChecked />
                <span>Firma aktywna po zapisaniu</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="featured" />
                <span>Wyróżniona firma</span>
              </label>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>03</span>
              <div>
                <h2>Usługi</h2>
                <p>Co firma wykonuje dla klienta.</p>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              {taxonomyOptions.services.length > 0 ? renderOptions(taxonomyOptions.services, "serviceIds") : <EmptyState text="Brak aktywnych usług w bazie." />}
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>04</span>
              <div>
                <h2>Możliwości technologiczne</h2>
                <p>Technologie, procesy, zaplecze testowe i kontrola jakości.</p>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              {taxonomyOptions.capabilities.length > 0 ? renderOptions(taxonomyOptions.capabilities, "capabilityIds") : <EmptyState text="Brak aktywnych możliwości w bazie." />}
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>05</span>
              <div>
                <h2>Branże</h2>
                <p>Dla jakich sektorów firma pracuje.</p>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              {taxonomyOptions.industries.length > 0 ? renderOptions(taxonomyOptions.industries, "industryIds") : <EmptyState text="Brak aktywnych branż w bazie." />}
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>06</span>
              <div>
                <h2>Certyfikaty i standardy</h2>
                <p>Normy jakości, certyfikaty i standardy wykonania.</p>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              {taxonomyOptions.certifications.length > 0 ? renderOptions(taxonomyOptions.certifications, "certificationIds") : <EmptyState text="Brak aktywnych certyfikatów w bazie." />}
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>07</span>
              <div>
                <h2>Skala produkcji</h2>
                <p>Pole nadal potrzebne dla obecnej wyszukiwarki.</p>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              {produkcja.map((item) => (
                <label key={item.id} className={styles.optionLabel}>
                  <input type="checkbox" name="produkcjaIds" value={item.id} />
                  <span>{item.zakres}</span>
                </label>
              ))}
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>08</span>
              <div>
                <h2>Stare działania EMS</h2>
                <p>Kompatybilność z aktualnym modelem wyszukiwarki do czasu etapu 5.</p>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              {dzialania.map((item) => (
                <label key={item.id} className={styles.optionLabel}>
                  <input type="checkbox" name="dzialaniaIds" value={item.id} />
                  <span>{item.nazwa}</span>
                </label>
              ))}
            </div>
          </section>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>Zapisz firmę</button>
            <Link href="/admin/firmy" className={styles.backBtn}>Anuluj</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
