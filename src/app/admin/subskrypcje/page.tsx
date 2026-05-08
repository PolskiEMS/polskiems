import Link from "next/link";
import {
  getAdminSubscriptions,
  updateCompanyPackageValidityAction,
} from "@/lib/actions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const { companies, bankTransferOrders } = await getAdminSubscriptions();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Subskrypcje</h1>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Firmy z pakietem Standard i Premium</h2>
              <p>
                Lista pokazuje aktywowane i oczekujące pakiety Standard/Premium. Z tego miejsca możesz
                sprawdzić dane firmy, przejść do edycji oraz ręcznie zmienić ważność pakietu.
              </p>
            </div>
            <span className={styles.counter}>{companies.length} firm</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Firma</th>
                  <th>Kontakt</th>
                  <th>Lokalizacja</th>
                  <th>Usługi</th>
                  <th>Pakiet</th>
                  <th>Limit zapytań</th>
                  <th>Ważny do</th>
                  <th>Status</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <tr key={company.id}>
                      <td>{company.id}</td>
                      <td>
                        <strong>{company.nazwa}</strong>
                        <div className={styles.smallText}>{company.featured ? "Wyróżniona" : "Bez wyróżnienia"}</div>
                      </td>
                      <td>
                        <div>{company.email || "-"}</div>
                        <div>{company.telefon || "-"}</div>
                      </td>
                      <td>
                        <div>{company.wojewodztwo || "-"}</div>
                        <div className={styles.smallText}>{company.adres || "-"}</div>
                      </td>
                      <td>
                        <div>{company.dzialania || "-"}</div>
                        {company.produkcja ? <div className={styles.smallText}>Skala: {company.produkcja}</div> : null}
                      </td>
                      <td>
                        <span className={styles.packageBadge}>{company.packageType}</span>
                      </td>
                      <td>{company.monthlyInquiryLimit ?? 0}</td>
                      <td>{company.packageValidUntil || "bezterminowo"}</td>
                      <td>{company.isActive ? "Aktywna" : "Oczekuje"}</td>
                      <td>
                        <div className={styles.actionsCell}>
                          <Link href={`/admin/firmy/${company.id}`} className={styles.editBtn}>
                            Edytuj
                          </Link>
                          <form
                            action={updateCompanyPackageValidityAction}
                            className={styles.periodForm}
                          >
                            <input type="hidden" name="companyId" value={company.id} />
                            <input
                              type="date"
                              name="packageValidUntil"
                              defaultValue={company.packageValidUntil?.split(" ")[0] || ""}
                              className={styles.periodInput}
                            />
                            <button type="submit" className={styles.periodBtn}>
                              Zapisz datę
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className={styles.emptyCell}>
                      Brak firm z pakietem Standard lub Premium.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Przelewy tradycyjne i dane do faktury</h2>
              <p>
                Zgłoszenia pakietów Standard/Premium wybrane z opcją przelewu tradycyjnego. Dane można wykorzystać do wystawienia faktury.
              </p>
            </div>
            <span className={styles.counter}>{bankTransferOrders.length} zgłoszeń</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Zam.</th>
                  <th>Data</th>
                  <th>Firma</th>
                  <th>Pakiet</th>
                  <th>Kwota</th>
                  <th>Status</th>
                  <th>Dane do faktury</th>
                  <th>Profil</th>
                </tr>
              </thead>
              <tbody>
                {bankTransferOrders.length > 0 ? (
                  bankTransferOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.createdAt || "-"}</td>
                      <td>{order.companyName}</td>
                      <td><span className={styles.packageBadge}>{order.packageType}</span></td>
                      <td>{order.amountGross} zł / {order.billingCycleMonths} mies.</td>
                      <td>{order.status}</td>
                      <td>
                        <div>{order.buyerCompanyName || order.buyerName || "-"}</div>
                        <div>{order.buyerTaxId ? `NIP: ${order.buyerTaxId}` : ""}</div>
                        <div>{order.buyerEmail || ""}</div>
                        <div>{order.buyerPhone || ""}</div>
                        <div className={styles.smallText}>
                          {[order.buyerAddressLine1, order.buyerPostalCode, order.buyerCity, order.buyerCountry]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </td>
                      <td>
                        {order.companyId ? (
                          <Link href={`/admin/firmy/${order.companyId}`} className={styles.editBtn}>
                            Edytuj firmę
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className={styles.emptyCell}>
                      Brak oczekujących zgłoszeń do przelewu tradycyjnego.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className={styles.bottomBack}>
          <Link href="/admin" className={styles.backBtn}>
            Powrót do panelu
          </Link>
        </div>
      </div>
    </div>
  );
}
