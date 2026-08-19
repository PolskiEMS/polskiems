import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicCompanyProfile } from "@/lib/actions";
import styles from "./style.module.css";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type PageProps = {
  params: Promise<{ id: string }>;
};

const hiddenDescriptions = new Set([["Twój", "krótki", "opis"].join(" ")]);
const hiddenPhones = new Set([["Twój", "numer", "telefonu"].join(" ")]);

function getVisibleDescription(description?: string | null) {
  if (!description?.trim() || hiddenDescriptions.has(description.trim())) {
    return "Opis zostanie uzupełniony wkrótce.";
  }

  return description;
}

function getVisibleValue(value?: string | null, hiddenValues?: Set<string>) {
  const normalizedValue = value?.trim();
  if (!normalizedValue || hiddenValues?.has(normalizedValue)) return "Brak danych";
  return normalizedValue;
}

export default async function ProducerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const companyId = Number(id);

  if (!Number.isInteger(companyId) || companyId <= 0) {
    return (
      <main className={styles.page}>
        <section className={styles.invalidProfile}>
          <h1>Nieprawidłowy profil producenta</h1>
          <Link href="/wszyscy-producenci" className={styles.primaryBtn}>
            Powrót do listy producentów
          </Link>
        </section>
      </main>
    );
  }

  const company = await getPublicCompanyProfile(companyId);
  if (!company) notFound();

  const websiteHref = company.www?.trim()
    ? company.www.startsWith("http")
      ? company.www
      : `https://${company.www}`
    : null;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Link href="/wszyscy-producenci" className={styles.backLink}>← Powrót do producentów</Link>
        <div className={styles.heroContent}>
          <Image
            src={`/images/producers/${company.nazwa}.jpg`}
            width={210}
            height={210}
            alt={`Logo producenta ${company.nazwa}`}
            className={styles.logo}
            priority
          />
          <div>
            <h1>{company.nazwa}</h1>
            {company.featured && (
              <div className={styles.badges}>
                <span className={styles.featuredBadge}>Polecany Producent</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Opis firmy</h2>
          <p>{getVisibleDescription(company.opis)}</p>
        </article>

        <article className={styles.card}>
          <h2>Dane kontaktowe</h2>
          <dl className={styles.details}>
            <div><dt>Województwo</dt><dd>{getVisibleValue(company.wojewodztwo)}</dd></div>
            <div><dt>Adres</dt><dd>{getVisibleValue(company.adres)}</dd></div>
            <div><dt>Telefon</dt><dd>{getVisibleValue(company.telefon, hiddenPhones)}</dd></div>
            <div><dt>Email</dt><dd>{getVisibleValue(company.email)}</dd></div>
            <div><dt>Strona WWW</dt><dd>{getVisibleValue(company.www)}</dd></div>
          </dl>
        </article>

        <article className={styles.card}>
          <h2>Działania EMS</h2>
          {company.dzialania.length ? (
            <ul className={styles.tags}>
              {company.dzialania.map((item) => <li key={item.id}>{item.nazwa}</li>)}
            </ul>
          ) : <p>Brak przypisanych działań EMS.</p>}
        </article>

        <article className={styles.card}>
          <h2>Skala produkcji</h2>
          {company.produkcja.length ? (
            <ul className={styles.tags}>
              {company.produkcja.map((item) => <li key={item.id}>{item.zakres}</li>)}
            </ul>
          ) : <p>Brak przypisanej skali produkcji.</p>}
        </article>
      </section>

      <section className={styles.actions} aria-label="Akcje profilu producenta">
        <Link
          href={`/zapytania-ofertowe?companyId=${company.id}&source=company_profile`}
          className={styles.primaryBtn}
        >
          Poproś o wycenę
        </Link>
        {company.email?.trim() && (
          <a href={`mailto:${company.email}`} className={styles.secondaryBtn}>Napisz email</a>
        )}
        {websiteHref && (
          <a href={websiteHref} target="_blank" rel="noreferrer" className={styles.secondaryBtn}>
            Strona firmy
          </a>
        )}
        <Link href="/wszyscy-producenci" className={styles.secondaryBtn}>
          Powrót do listy producentów
        </Link>
      </section>
    </main>
  );
}
