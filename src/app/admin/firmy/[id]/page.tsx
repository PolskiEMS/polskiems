import Link from "next/link";
import styles from "../style.module.css";
import {
  getCompanyById,
  getAllRegion,
  updateCompanyAction,
  getAllDzialaniaEms,
  getAllProdukcjaScales,
  getCompanyRelations,
} from "@/lib/actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCompanyPage({ params }: Props) {
  const { id } = await params;
  const company = await getCompanyById(Number(id));
  const region = await getAllRegion();
  const dzialania = await getAllDzialaniaEms();
  const produkcjaScales = await getAllProdukcjaScales();
  const relations = await getCompanyRelations(Number(id));

  if (!company) {
    return (
      <div className={styles.page}>
        <div className={styles.formTop}>
        <Link href="/admin/firmy" className={styles.editBtn}>
          Powrót do Firmy
        </Link>
      </div>
        <div className={styles.formBox}>
          <h1 className={styles.title}>Nie znaleziono firmy</h1>
          <div className={styles.actions}>
            <Link href="/admin/firmy" className={styles.cancelBtn}>
              Powrót do listy
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.formTop}>
        <Link href="/admin/firmy" className={styles.backBtn}>
          Powrót do Firmy
        </Link>
      </div>
      <div className={styles.formBox}>
        <h1 className={styles.title}>Edytuj firmę</h1>

        <form action={updateCompanyAction} className={styles.form}>
          <input type="hidden" name="id" value={company.id} />

          <div className={styles.field}>
            <label htmlFor="nazwa">Nazwa firmy</label>
            <input
              id="nazwa"
              name="nazwa"
              defaultValue={company.nazwa ?? ""}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="opis">Opis</label>
            <textarea
              id="opis"
              name="opis"
              defaultValue={company.opis ?? ""}
              className={styles.textarea}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="telefon">Telefon</label>
            <input
              id="telefon"
              name="telefon"
              defaultValue={company.telefon ?? ""}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={company.email ?? ""}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="www">WWW</label>
            <input
              id="www"
              name="www"
              defaultValue={company.www ?? ""}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="wojewodztwoId">Województwo</label>
            <select
              id="wojewodztwoId"
              name="wojewodztwoId"
              defaultValue={company.wojewodztwoId ? String(company.wojewodztwoId) : ""}
              className={styles.select}
            >
              <option value="">Wybierz województwo</option>
              {region.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.nazwa}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Działania / wymagania</label>
            <div className={styles.checkboxGroup}>
              {dzialania.map((item) => (
                <label key={item.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    name="dzialaniaIds"
                    value={item.id}
                    defaultChecked={relations.dzialaniaIds.includes(item.id)}
                  />
                  {item.nazwa}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>Produkcja / skala produkcji</label>
            <div className={styles.checkboxGroup}>
              {produkcjaScales.map((item) => (
                <label key={item.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    name="produkcjaIds"
                    value={item.id}
                    defaultChecked={relations.produkcjaIds.includes(item.id)}
                  />
                  {item.zakres}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="packageType">Pakiet</label>
            <select
              id="packageType"
              name="packageType"
              className={styles.select}
              defaultValue={company.packageType ?? "standard"}
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          <div className={styles.field}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" name="resetInquiryCount" />
              Wyzeruj licznik miesięcznych zapytań
            </label>
          </div>

          <div className={styles.field}>
            <label>Licznik zapytań w tym miesiącu</label>
            <input
              className={styles.input}
              value={`${company.monthlyInquiryCount ?? 0} / ${company.monthlyInquiryLimit ?? 0}`}
              readOnly
            />
          </div>

          <div className={styles.field}>
            <label>
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={Boolean(company.isActive)}
              />{" "}
              Aktywna
            </label>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              Zapisz zmiany
            </button>
            <Link href="/admin/firmy" className={styles.cancelBtn}>
              Anuluj
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
