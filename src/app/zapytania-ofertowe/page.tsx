import { getAllProducers, sendInquiryAction } from "@/lib/actions";
import { sendInquiryToCompanyAction } from "@/lib/actions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";

export default async function InquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string; success?: string }>;
}) {
  const params = await searchParams;
  const companyId = Number(params?.companyId ?? 0);
  const success = params?.success === "1";

  const companies = await getAllProducers();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Zapytanie ofertowe</h1>

        {success && (
          <div className={styles.successBox}>
            Zapytanie zostało wysłane pomyślnie.
          </div>
        )}

        <form action={sendInquiryAction} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="companyId">Firma</label>
            <select
              id="companyId"
              name="companyId"
              defaultValue={companyId || ""}
              className={styles.select}
              required
            >
              <option value="">Wybierz firmę</option>
              {companies.map((company: any) => (
                <option key={company.id} value={company.id}>
                  {company.nazwa}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="customerName">Imię i nazwisko</label>
            <input id="customerName" name="customerName" className={styles.input} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="customerCompany">Firma</label>
            <input id="customerCompany" name="customerCompany" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label htmlFor="customerEmail">Email</label>
            <input id="customerEmail" name="customerEmail" type="email" className={styles.input} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="customerPhone">Telefon</label>
            <input id="customerPhone" name="customerPhone" className={styles.input} />
          </div>

          <div className={styles.field}>
            <label htmlFor="serviceType">Typ usługi</label>
            <select id="serviceType" name="serviceType" className={styles.select} required>
              <option value="">Wybierz usługę</option>
              <option value="Projekt">Projekt</option>
              <option value="Dostarcza PCB">Dostarcza PCB</option>
              <option value="Kupuje komponenty">Kupuje komponenty</option>
              <option value="Montaż SMD">Montaż SMD</option>
              <option value="Montaż THT">Montaż THT</option>
              <option value="Inspekcja">Inspekcja</option>
              <option value="Test Flying Probe">Test Flying Probe</option>
              <option value="Montaż produktu finalnego">Montaż produktu finalnego</option>
              <option value="Conformal Coating">Conformal Coating</option>
              <option value="Mycie płytek">Mycie płytek</option>
              <option value="Lakierowanie">Lakierowanie</option>
              <option value="Hermetyzacja">Hermetyzacja</option>
              <option value="IPC Klasa 3">IPC Klasa 3</option>
              <option value="IPC Klasa 2">IPC Klasa 2</option>
              <option value="IPC Klasa 1">IPC Klasa 1</option>
              <option value="Umożliwia audyt">Umożliwia audyt</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="quantity">Ilość / skala</label>
            <input id="quantity" name="quantity" className={styles.input} placeholder="np. 1000 szt." />
          </div>

          <div className={styles.field}>
            <label htmlFor="deadline">Termin realizacji</label>
            <input id="deadline" name="deadline" className={styles.input} placeholder="np. 4 tygodnie" />
          </div>

          <div className={styles.field}>
            <label htmlFor="message">Opis projektu</label>
            <textarea id="message" name="message" className={styles.textarea} required />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.submitBtn}>
              Wyślij zapytanie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
