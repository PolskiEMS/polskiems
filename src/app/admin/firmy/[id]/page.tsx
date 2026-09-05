import Link from "next/link";
import {
  getCompanyById,
  getCompanyRelations,
  getAllDzialaniaEms,
  getAllProdukcjaScales,
  getAllRegion,
  updateCompanyAction,
} from "@/lib/actions";
import {
  deleteCompanyWithTaxonomyAction,
  getCompanyTaxonomyRelations,
  getSupplierTaxonomyOptions,
  updateCompanyTaxonomyAction,
} from "@/lib/adminCompanyTaxonomyActions";
import { COMPANY_TYPE_LABELS } from "@/lib/supplierTaxonomy";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type TaxonomyOption = {
  id: number;
  name: string;
  code?: string;
};

function renderOptions(
  options: TaxonomyOption[],
  selectedIds: Set<number>,
  fieldName: string,
  getLabel: (option: TaxonomyOption) => string = (option) => option.name
) {
  return options.map((item) => (
    <label key={item.id} className={styles.optionLabel}>
      <input
        type="checkbox"
        name={fieldName}
        value={item.id}
        defaultChecked={selectedIds.has(item.id)}
      />
      <span>{getLabel(item)}</span>
    </label>
  ));
}

function EmptyState({ text }: { text: string }) {
  return <p className={styles.emptyState}>{text}</p>;
}

export default async function EditCompanyPage({ params }: PageProps) {
  const { id } = await params;
  const companyId = Number(id);

  if (!Number.isFinite(companyId) || companyId <= 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Nieprawidłowe ID firmy</h1>
          <div className={styles.actions}>
            <Link href="/admin/firmy" className={styles.backBtn}>
              Powrót
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const company = await getCompanyById(companyId);

  if (!company) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Nie znaleziono firmy</h1>
          <div className={styles.actions}>
            <Link href="/admin/firmy" className={styles.backBtn}>
              Powrót
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const relations = await getCompanyRelations(companyId);
  const taxonomyRelations = await getCompanyTaxonomyRelations(companyId);
  const taxonomyOptions = await getSupplierTaxonomyOptions();
  const dzialania = await getAllDzialaniaEms();
  const produkcja = await getAllProdukcjaScales();
  const regions = await getAllRegion();

  const selectedDzialaniaIds = new Set(relations.dzialaniaIds);
  const selectedProdukcjaIds = new Set(relations.produkcjaIds);
  const selectedServiceIds = new Set(taxonomyRelations.serviceIds);
  const selectedCapabilityIds = new Set(taxonomyRelations.capabilityIds);
  const selectedIndustryIds = new Set(taxonomyRelations.industryIds);
  const selectedCertificationIds = new Set(taxonomyRelations.certificationIds);

  const taxonomySelectedCount =
    selectedServiceIds.size +
    selectedCapabilityIds.size +
    selectedIndustryIds.size +
    selectedCertificationIds.size;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Panel administratora</p>
            <h1 className={styles.title}>Edytuj firmę</h1>
            <p className={styles.subtitle}>
              Najpierw dane podstawowe, niżej docelowa taksonomia: typ firmy, usługi, możliwości, branże i certyfikaty.
            </p>
          </div>

          <Link href="/admin/firmy" className={styles.backBtn}>
            Powrót do firm
          </Link>
        </div>

        <form action={updateCompanyAction} className={styles.form}>
          <input type="hidden" name="id" value={String(company.id)} />

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>01</span>
              <div>
                <h2>Dane podstawowe</h2>
                <p>Nazwa, kontakt, lokalizacja, opis i pakiet widoczności.</p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="nazwa">Nazwa firmy</label>
                <input id="nazwa" name="nazwa" type="text" defaultValue={company.nazwa || ""} required />
              </div>

              <div className={styles.field}>
                <label htmlFor="telefon">Telefon</label>
                <input id="telefon" name="telefon" type="text" defaultValue={company.telefon || ""} />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" defaultValue={company.email || ""} />
              </div>

              <div className={styles.field}>
                <label htmlFor="www">Strona WWW</label>
                <input id="www" name="www" type="text" defaultValue={company.www || ""} placeholder="https://..." />
              </div>

              <div className={styles.field}>
                <label htmlFor="wojewodztwoId">Województwo</label>
                <select id="wojewodztwoId" name="wojewodztwoId" defaultValue={company.wojewodztwoId ? String(company.wojewodztwoId) : ""}>
                  <option value="">Wybierz województwo</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>{region.nazwa}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="adres">Adres</label>
                <input id="adres" name="adres" type="text" defaultValue={company.adres || ""} placeholder="ulica, kod, miasto" />
              </div>

              <div className={styles.field}>
                <label htmlFor="packageType">Pakiet</label>
                <select id="packageType" name="packageType" defaultValue={company.packageType || "free"}>
                  <option value="free">Free</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <div className={styles.fieldFull}>
              <label htmlFor="opis">Opis firmy</label>
              <textarea id="opis" name="opis" rows={5} defaultValue={company.opis || ""} />
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>02</span>
              <div>
                <h2>Status i limity</h2>
                <p>Aktywacja profilu, wyróżnienie i miesięczny limit zapytań.</p>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div><strong>Pakiet</strong><span>{company.packageType || "free"}</span></div>
              <div><strong>Limit leadów</strong><span>{company.monthlyInquiryLimit ?? 0}</span></div>
              <div><strong>Wykorzystane leady</strong><span>{company.monthlyInquiryCount ?? 0}</span></div>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="isActive" defaultChecked={Boolean(company.isActive)} />
                <span>Firma aktywna</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="featured" defaultChecked={Boolean(company.featured)} />
                <span>Wyróżniona firma</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="resetInquiryCount" />
                <span>Resetuj licznik leadów</span>
              </label>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>03</span>
              <div>
                <h2>Skala produkcji</h2>
                <p>To pole zostaje potrzebne dla obecnej wyszukiwarki i profili.</p>
              </div>
            </div>

            <div className={styles.optionsGrid}>
              {produkcja.map((item) => (
                <label key={item.id} className={styles.optionLabel}>
                  <input type="checkbox" name="produkcjaId" value={item.id} defaultChecked={selectedProdukcjaIds.has(item.id)} />
                  <span>{item.zakres}</span>
                </label>
              ))}
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>04</span>
              <div>
                <h2>Stare działania EMS</h2>
                <p>Kompatybilność z aktualną wyszukiwarką do czasu pełnego przepięcia na nowy model.</p>
              </div>
            </div>

            <div className={styles.optionsGrid}>
              {dzialania.map((item) => (
                <label key={item.id} className={styles.optionLabel}>
                  <input type="checkbox" name="dzialaniaId" value={item.id} defaultChecked={selectedDzialaniaIds.has(item.id)} />
                  <span>{item.nazwa}</span>
                </label>
              ))}
            </div>
          </section>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>Zapisz dane podstawowe</button>
            <Link href="/admin/firmy" className={styles.backBtn}>Anuluj</Link>
          </div>
        </form>

        <form action={updateCompanyTaxonomyAction} className={styles.form}>
          <input type="hidden" name="id" value={String(company.id)} />
          <input type="hidden" name="companyName" value={company.nazwa || ""} />

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>05</span>
              <div>
                <h2>Nowa taksonomia dostawcy</h2>
                <p>
                  Docelowe dane pod platformę B2B. Wybrano obecnie: {taxonomySelectedCount} pozycji.
                </p>
              </div>
            </div>

            <div className={styles.fieldFull}>
              <label htmlFor="companyType">Typ firmy</label>
              <select id="companyType" name="companyType" defaultValue={taxonomyRelations.companyType}>
                {Object.entries(COMPANY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>06</span>
              <div>
                <h2>Usługi</h2>
                <p>Co firma wykonuje dla klienta: montaż, testy, prototypy, box build, komponenty.</p>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              {taxonomyOptions.services.length > 0 ? renderOptions(taxonomyOptions.services, selectedServiceIds, "serviceIds") : <EmptyState text="Brak aktywnych usług w bazie." />}
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>07</span>
              <div>
                <h2>Możliwości technologiczne</h2>
                <p>Technologie, procesy, zaplecze testowe i kontrola jakości.</p>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              {taxonomyOptions.capabilities.length > 0 ? renderOptions(taxonomyOptions.capabilities, selectedCapabilityIds, "capabilityIds") : <EmptyState text="Brak aktywnych możliwości w bazie." />}
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>08</span>
              <div>
                <h2>Branże</h2>
                <p>Sektory, dla których firma ma doświadczenie lub deklarowane kompetencje.</p>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              {taxonomyOptions.industries.length > 0 ? renderOptions(taxonomyOptions.industries, selectedIndustryIds, "industryIds") : <EmptyState text="Brak aktywnych branż w bazie." />}
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span>09</span>
              <div>
                <h2>Certyfikaty i standardy</h2>
                <p>Normy jakości, certyfikaty i standardy wykonania istotne przy projektach high-reliability.</p>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              {taxonomyOptions.certifications.length > 0
                ? renderOptions(taxonomyOptions.certifications, selectedCertificationIds, "certificationIds", (item) => item.name)
                : <EmptyState text="Brak aktywnych certyfikatów w bazie." />}
            </div>
          </section>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>Zapisz taksonomię</button>
            <Link href="/admin/firmy" className={styles.backBtn}>Powrót do listy</Link>
          </div>
        </form>

        <form action={deleteCompanyWithTaxonomyAction} className={styles.deleteForm}>
          <input type="hidden" name="id" value={String(company.id)} />
          <button type="submit" className={styles.deleteBtn}>Usuń firmę</button>
        </form>
      </div>
    </div>
  );
}
