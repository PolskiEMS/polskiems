import styles from './styles.module.css'
import Link from "next/link";
import PageViewTracker from "@/app/components/PageViewTracker";
import { getFeaturedProducers } from "@/lib/actions";
import ProducerCard from "@/app/components/ProducerCard/ProducerCard";

export const dynamic = "force-dynamic";

const valuePropositions = [
  {
    audience: "Dla firm szukających producenta",
    benefit: "Porównujesz dostawców według usług, lokalizacji i skali produkcji.",
  },
  {
    audience: "Dla producentów EMS",
    benefit: "Budujesz widoczność, profil firmowy i źródło zapytań ofertowych.",
  },
  {
    audience: "Dla zakupów i R&D",
    benefit: "Szybciej zawężasz firmy pasujące do projektu elektronicznego.",
  },
];

const howItWorksSteps = [
  "Wybierasz usługę lub wpisujesz potrzebę projektu",
  "Filtrujesz firmy po regionie, usługach i skali produkcji",
  "Sprawdzasz profil producenta",
  "Wysyłasz zapytanie ofertowe do wybranej firmy",
];

const audienceItems = [
  "Startup hardware",
  "Firma produkcyjna",
  "Dział R&D",
  "Producent urządzeń IoT",
  "Firma szukająca montażu SMT/THT",
  "Firma potrzebująca prototypu",
];

const faqItems = [
  {
    question: "Czy muszę samodzielnie wybierać firmę EMS?",
    answer: "Możesz wskazać konkretną firmę albo wysłać zapytanie do dopasowania. PolskiEMS pomaga uporządkować potrzeby projektu i skrócić listę producentów.",
  },
  {
    question: "Co dzieje się z zapytaniem ofertowym po wysłaniu?",
    answer: "Zapytanie trafia do systemu PolskiEMS. Docelowo może być weryfikowane i przekazywane do wybranych lub dopasowanych producentów.",
  },
  {
    question: "Jakie informacje warto uzupełnić w formularzu?",
    answer: "Najważniejsze są: typ usługi, skala produkcji, termin, dokumentacja techniczna, wymagania jakościowe, testy i opis ograniczeń projektu.",
  },
  {
    question: "Co zyskuje firma EMS obecna w PolskiEMS?",
    answer: "Firma EMS otrzymuje profesjonalny profil, lepszą widoczność w katalogu i możliwość prezentacji swojej oferty klientom szukającym produkcji elektroniki.",
  },
];

export default async function Home() {
  let featuredProducers: Awaited<ReturnType<typeof getFeaturedProducers>> = [];

  try {
    featuredProducers = await getFeaturedProducers(3);
  } catch (error) {
    console.error("Failed to load featured producers", error);
  }

  return (
    <main className={styles.page}>
      <PageViewTracker page="home" />

      <section className={styles.hero}>
        <p className={styles.kicker}>Platforma B2B dla elektroniki</p>
        <h1>Znajdź producenta elektroniki dopasowanego do projektu.</h1>
        <p className={styles.lead}>
          PolskiEMS pomaga porównywać firmy EMS w Polsce według usług, lokalizacji, skali produkcji i możliwości wykonania projektu.
        </p>

        <div className={styles.heroActions}>
          <Link href="/wyszukaj" className={styles.primaryAction}>Znajdź producenta</Link>
          <Link href="/dodaj-producenta" className={styles.secondaryAction}>Dodaj firmę EMS</Link>
        </div>
      </section>

      <section className={styles.valueProposition} aria-label="Korzyści PolskiEMS">
        {valuePropositions.map((item) => (
          <article key={item.audience} className={styles.valueCard}>
            <strong>{item.audience}</strong>
            <span>{item.benefit}</span>
          </article>
        ))}
      </section>

      <section className={styles.infoSections}>
        <article className={styles.infoCard}>
          <p className={styles.sectionKicker}>Proces</p>
          <h2>Jak działa PolskiEMS?</h2>
          <ol className={styles.stepsList}>
            {howItWorksSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className={styles.infoCard}>
          <p className={styles.sectionKicker}>Dla kogo</p>
          <h2>Kto skorzysta z platformy?</h2>
          <ul className={styles.audienceList}>
            {audienceItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      {featuredProducers.length > 0 && (
        <section className={styles.recommendedSection}>
          <p className={styles.sectionKicker}>Widoczność producentów</p>
          <h2>Polecani producenci</h2>
          <div className={styles.recommendedGrid}>
            {featuredProducers.map((featuredProducer, index) => (
              <ProducerCard producer={featuredProducer} index={index} key={featuredProducer.id ?? `${featuredProducer.nazwa}-${index}`} />
            ))}
          </div>
        </section>
      )}

      <section className={styles.rfqSection}>
        <div className={styles.recommendedCta}>
          <p className={styles.sectionKicker}>Zapytanie ofertowe</p>
          <h2>Szukasz partnera EMS do projektu?</h2>
          <p>
            Opisz potrzeby projektu, skalę produkcji, termin i wymagania techniczne. Formularz pomoże zebrać dane potrzebne do rozmowy z producentem elektroniki.
          </p>
          <Link href="/zapytania-ofertowe" className={styles.primaryAction}>
            Dodaj zapytanie ofertowe
          </Link>
        </div>
      </section>

      <section className={styles.faqSection}>
        <p className={styles.sectionKicker}>FAQ</p>
        <h2>Najczęstsze pytania</h2>
        <div className={styles.faqGrid}>
          {faqItems.map((item) => (
            <article key={item.question} className={styles.faqCard}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.seoSection}>
        <p className={styles.sectionKicker}>Usługi EMS</p>
        <h2>Najczęściej wyszukiwane obszary</h2>
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
