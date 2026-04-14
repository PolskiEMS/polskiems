import Link from "next/link";
import {
  getAdminSubscriptions,
  updateCompanyPackageValidityAction,
} from "@/lib/actions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const { companies, orders } = await getAdminSubscriptions();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Subskrypcje i zakupy pakietów</h1>

        <section className={styles.section}>
          <h2>Firmy z pakietem płatnym / wyróżnieniem</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Firma</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Pakiet</th>
                  <th>Wyróżnienie</th>
                  <th>Limit zapytań</th>
                  <th>Ważny do</th>
                  <th>Status</th>
                  <th>Zmień okres</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.id}</td>
                    <td>{company.nazwa}</td>
                    <td>{company.email || "-"}</td>
                    <td>{company.telefon || "-"}</td>
                    <td>{company.packageType || "free"}</td>
                    <td>{company.featured ? "Tak" : "Nie"}</td>
                    <td>{company.monthlyInquiryLimit ?? 0}</td>
                    <td>{company.packageValidUntil || "-"}</td>
                    <td>{company.isActive ? "Aktywna" : "Nieaktywna"}</td>
                    <td>
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
                          Zapisz
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Historia zakupów pakietów (z danymi do faktury)</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Zam.</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Firma</th>
                  <th>Pakiet</th>
                  <th>Okres</th>
                  <th>Kwota</th>
                  <th>Płatność</th>
                  <th>Aktywna do</th>
                  <th>Dane faktury</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.createdAt || "-"}</td>
                    <td>{order.status}</td>
                    <td>{order.companyName}</td>
                    <td>{order.packageType}</td>
                    <td>{order.billingCycleMonths} mies.</td>
                    <td>{order.amountGross} zł</td>
                    <td>{order.provider}</td>
                    <td>{order.accessValidUntil || "-"}</td>
                    <td>
                      <div>{order.buyerCompanyName || order.buyerName || "-"}</div>
                      <div>{order.buyerTaxId ? `NIP: ${order.buyerTaxId}` : ""}</div>
                      <div>{order.buyerEmail || ""}</div>
                      <div>
                        {[order.buyerAddressLine1, order.buyerPostalCode, order.buyerCity, order.buyerCountry]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </td>
                  </tr>
                ))}
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
