import Link from "next/link";
import styles from "./seo-pages.module.css";
import type { SeoPageData } from "./types";

type Props = {
  data: SeoPageData;
};

export default function SeoPageTemplateB({ data }: Props) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>{data.title}</h1>
        {data.lead.map((paragraph) => (
          <p key={paragraph} className={styles.lead}>
            {paragraph}
          </p>
        ))}
      </section>

      <section className={styles.contentCard}>
        {data.mainSections.map((section) => (
          <article key={section.heading} className={styles.section}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}

        {data.infoBoxes && (
          <div className={styles.infoGrid}>
            {data.infoBoxes.map((info) => (
              <article key={info.heading} className={styles.infoBox}>
                <h3>{info.heading}</h3>
                <p>{info.text}</p>
              </article>
            ))}
          </div>
        )}

        <div className={styles.ctaRow}>
          <Link href={data.searchHref} className={styles.primaryBtn}>
            Wyszukaj producenta
          </Link>
          <Link href="/wszyscy-producenci" className={styles.secondaryBtn}>
            Wszyscy producenci
          </Link>
        </div>
      </section>
    </main>
  );
}
