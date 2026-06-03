import styles from './styles.module.css'
import Link from "next/link";
import PageViewTracker from "@/app/components/PageViewTracker";
import Image from "next/image";
import { getFeaturedProducers } from "@/lib/actions";

const hiddenDescriptions = new Set([["Twój", "krótki", "opis"].join(" ")]);

const howItWorksSteps = [
  "Wybierasz usługę",
  "Filtrujesz firmy",
  "Wysyłasz zapytanie",
  "Otrzymujesz kontakt lub ofertę",
];

const audienceItems = [
  "Startup hardware",
  "Firma produkcyjna",
  "Dział R&D",
  "Producent urządzeń IoT",
  "Firma szukająca montażu SMT/THT",
  "Firma potrzebująca prototypu",
];

const getProducerDescription = (description?: string | null) => {
  if (!description || hiddenDescriptions.has(description.trim())) {
    return null;
  }

  return description;
};

export default async function Home() {
  const featuredProducers = await getFeaturedProducers(3);

  return (
    <main className={styles.page}>
      <PageViewTracker page="home" />

      <section className={styles.hero}>
        <h1>Polski <br /> EMS</h1>
        <h2>Znajdź swojego producenta</h2>
        <div className={styles.buttons}>
          <Link href={'/wyszukaj'}><button>Wyszukaj</button></Link>
          <Link href={'/wszyscy-producenci'}><button>Wszyscy Producenci</button></Link>
        </div>
        <Link href={'/api/formularz-v2'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>
      </section>

      <section className={styles.infoSections}>
        <article className={styles.infoCard}>
          <h3>Jak działa PolskiEMS?</h3>
          <ol className={styles.stepsList}>
            {howItWorksSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className={styles.infoCard}>
          <h3>Dla kogo?</h3>
          <ul className={styles.audienceList}>
            {audienceItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      {featuredProducers.length > 0 && (
        <section className={styles.recommendedSection}>
          <h3>Polecani producenci</h3>
          <div className={styles.recommendedGrid}>
            {featuredProducers.map((featuredProducer, index) => (
              <div key={featuredProducer.id ?? index} className={styles.recommendedCard}>
                <Image
                  src={`/images/producers/${featuredProducer.nazwa}.jpg`}
                  width={110}
                  height={110}
                  alt={`Polecany producent ${featuredProducer.nazwa}`}
                />
                <div className={styles.recommendedContent}>
                  <h4>{featuredProducer.nazwa}</h4>
                  <p>{getProducerDescription(featuredProducer.opis) || "Sprawdź profil producenta i poproś o wycenę."}</p>
                  <div className={styles.recommendedActions}>
                    <Link href="/wszyscy-producenci">Zobacz profil</Link>
                    {featuredProducer.id && (
                      <Link href={`/zapytania-ofertowe?companyId=${featuredProducer.id}&source=company_card`}>
                        Poproś o wycenę
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.rfqSection}>
        <div className={styles.recommendedCta}>
          <h4 className={styles.recommendedCtaTitle}>Zapytanie ofertowe</h4>
          <p>
            Szukasz partnera EMS do projektu seryjnego lub prototypowego? Wyślij jedno zapytanie,
            a dopasujemy je do firm gotowych do szybkiej i rzetelnej wyceny.
          </p>
          <Link href="/zapytania-ofertowe" className={styles.recommendedCtaButton}>
            Dodaj zapytanie ofertowe
          </Link>
        </div>
      </section>

      <section className={styles.seoSection}>
        <h3>Najczęściej wyszukiwane usługi EMS</h3>
        <div className={styles.seoLinks}>
          <Link href="/produkcja-pcb-polska">Produkcja PCB w Polsce</Link>
          <Link href="/montaz-smt-polska">Montaż SMT w Polsce</Link>
          <Link href="/montaz-tht-polska">Montaż THT w Polsce</Link>
          <Link href="/montaz-elektroniki-w-polsce">Montaż elektroniki w Polsce</Link>
          <Link href="/kontraktowy-montaz-elektroniki">Kontraktowy montaż elektroniki w Polsce</Link>
        </div>
      </section>
    </main>
  );
}
