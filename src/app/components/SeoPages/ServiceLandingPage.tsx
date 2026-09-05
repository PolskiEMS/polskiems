import Image from "next/image";
import Link from "next/link";
import styles from "./service-landing.module.css";

type Section = {
  heading: string;
  paragraphs: string[];
};

type Card = {
  title: string;
  text: string;
};

type Props = {
  title: string;
  lead: string;
  searchHref: string;
  heroImage: {
    src: string;
    alt: string;
  };
  sections: Section[];
  cards: Card[];
};

export default function ServiceLandingPage({
  title,
  lead,
  searchHref,
  heroImage,
  sections,
  cards,
}: Props) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Baza wiedzy PolskiEMS</p>
          <h1>{title}</h1>
          <p className={styles.lead}>{lead}</p>

          <div className={styles.heroMeta} aria-label="Główne zastosowania">
            <span>Dobór dostawcy</span>
            <span>Wycena projektu</span>
            <span>Produkcja B2B</span>
          </div>

          <div className={styles.ctaRow}>
            <Link href={searchHref} className={styles.primaryBtn}>
              Wyszukaj producenta
            </Link>
            <Link href="/wszyscy-producenci" className={styles.secondaryBtn}>
              Wszyscy producenci
            </Link>
          </div>
        </div>

        <div className={styles.heroImageWrap}>
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            className={styles.heroImage}
            sizes="(max-width: 1024px) 100vw, 460px"
            priority
          />
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.contentHeader}>
          <p>Przewodnik</p>
          <h2>Najważniejsze informacje przed wyborem firmy EMS</h2>
        </div>

        <div className={styles.sectionGrid}>
          {sections.map((section, index) => (
            <article key={section.heading} className={styles.section}>
              <span className={styles.sectionNumber}>{index + 1}</span>
              <h3>{section.heading}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>

        <div className={styles.cardGrid}>
          {cards.map((card) => (
            <article key={card.title} className={styles.card}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.bottomCta}>
        <p className={styles.eyebrow}>Następny krok</p>
        <h2>Porównaj firmy i wybierz partnera do projektu</h2>
        <p>
          Sprawdź producentów EMS, którzy realizują {title.toLowerCase()} i skróć
          czas wyboru dostawcy dzięki jednemu katalogowi B2B.
        </p>
        <div className={styles.ctaRow}>
          <Link href={searchHref} className={styles.primaryBtn}>
            Znajdź partnera
          </Link>
          <Link href="/dodaj-producenta" className={styles.secondaryBtn}>
            Dodaj firmę EMS
          </Link>
        </div>
      </section>
    </main>
  );
}
