import Link from "next/link";
import {
  getCompanyById,
  getCompanyRelations,
  getAllDzialaniaEms,
  getAllProdukcjaScales,
  getAllRegion,
  updateCompanyAction,
  deleteCompanyAction,
} from "@/lib/actions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
  const dzialania = await getAllDzialaniaEms();
  const produkcja = await getAllProdukcjaScales();
  const regions = await getAllRegion();

  const selectedDzialaniaIds = new Set(relations.dzialaniaIds);
  const selectedProdukcjaIds = new Set(relations.produkcjaIds);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Edytuj firmę</h1>

        <form action={updateCompanyAction} className={styles.form}>
          <input type="hidden" name="id" value={String(company.id)} />

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="nazwa">Nazwa firmy</label>
              <input
                id="nazwa"
                name="nazwa"
                type="text"
                defaultValue={company.nazwa || ""}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="telefon">Telefon</label>
              <input
                id="telefon"
                name="telefon"
                type="text"
                defaultValue={company.telefon || ""}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={company.email || ""}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="www">Strona WWW</label>
              <input
                id="www"
                name="www"
                type="text"
                defaultValue={company.www || ""}
                placeholder="https://..."
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="wojewodztwoId">Województwo</label>
              <select
                id="wojewodztwoId"
                name="wojewodztwoId"
                defaultValue={company.wojewodztwoId ? String(company.wojewodztwoId) : ""}
              >
                <option value="">Wybierz województwo</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.nazwa}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="adres">Adres</label>
              <input
                id="adres"
                name="adres"
                type="text"
                defaultValue={company.adres || ""}
                placeholder="ulica, kod, miasto"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="packageType">Pakiet</label>
              <select
                id="packageType"
                name="packageType"
                defaultValue={company.packageType || "free"}
              >
                <option value="free">Free</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div className={styles.fieldFull}>
            <label htmlFor="opis">Opis firmy</label>
            <textarea
              id="opis"
              name="opis"
              rows={5}
              defaultValue={company.opis || ""}
            />
          </div>

          <div className={styles.infoBox}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Aktualny pakiet:</span>{" "}
              {company.packageType || "free"}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Limit leadów:</span>{" "}
              {company.monthlyInquiryLimit ?? 0}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Wykorzystane leady:</span>{" "}
              {company.monthlyInquiryCount ?? 0}
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={Boolean(company.isActive)}
              />
              <span>Firma aktywna</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="featured"
                defaultChecked={Boolean(company.featured)}
              />
              <span>Wyróżniona firma</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="resetInquiryCount" />
              <span>Resetuj licznik leadów</span>
            </label>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Działania EMS</h2>
            <div className={styles.optionsGrid}>
              {dzialania.map((item) => (
                <label key={item.id} className={styles.optionLabel}>
                  <input
                    type="checkbox"
                    name="dzialaniaId"
                    value={item.id}
                    defaultChecked={selectedDzialaniaIds.has(item.id)}
                  />
                  <span>{item.nazwa}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Skala produkcji</h2>
            <div className={styles.optionsGrid}>
              {produkcja.map((item) => (
                <label key={item.id} className={styles.optionLabel}>
                  <input
                    type="checkbox"
                    name="produkcjaId"
                    value={item.id}
                    defaultChecked={selectedProdukcjaIds.has(item.id)}
                  />
                  <span>{item.zakres}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              Zapisz zmiany
            </button>

            <Link href="/admin/firmy" className={styles.backBtn}>
              Powrót
            </Link>
          </div>
        </form>

        <form action={deleteCompanyAction} className={styles.deleteForm}>
          <input type="hidden" name="id" value={String(company.id)} />
          <button type="submit" className={styles.deleteBtn}>
            Usuń firmę
          </button>
        </form>
      </div>
    </div>
  );
}
