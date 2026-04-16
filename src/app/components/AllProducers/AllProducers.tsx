'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';
import styles from './styles.module.css';
import { trackCompanyEvent } from '@/lib/trackCompanyEvent';

type Producer = {
  id?: number;
  nazwa: string;
  opis?: string | null;
  email?: string | null;
  www?: string | null;
  featured?: boolean | null;
  packageType?: string | null;
};

const AllProducers = ({ producers }: { producers: Producer[] }) => {
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const getProducerKey = (producer: Producer, index: number) =>
    String(producer.id ?? `${producer.nazwa}-${index}`);

  const toggleDescription = (key: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.producers}>
        {producers.map((producer, i) => {
          const key = getProducerKey(producer, i);
          const isExpanded = Boolean(expandedDescriptions[key]);
          const hasLongDescription = (producer.opis?.trim().length ?? 0) > 110;

          return (
          <motion.div
            className={`${styles.producerBlock} ${producer.featured ? styles.featuredBlock : ''}`}
            key={key}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            onViewportEnter={() => {
              if (producer.id) trackCompanyEvent(producer.id, 'view');
            }}
            transition={{ duration: 1.2, delay: i <= 2 ? 0.3 * i : 0.3 }}
          >
            <div className={styles.divToMove}>
              <Image
                src={`/images/producers/${producer.nazwa}.jpg`}
                width={160}
                height={160}
                className={styles.producerImage}
                alt={`Producent ${producer.nazwa}`}
              />

              {producer.featured && (
                <div className={styles.featuredBadge}>Polecany Producent</div>
              )}

              <h2>{producer.nazwa}</h2>

              <div className={styles.bottom}>
                <p className={`${styles.description} ${isExpanded ? styles.expandedDescription : ''}`}>
                  {producer.opis}
                </p>

                {hasLongDescription && (
                  <button
                    type="button"
                    className={styles.toggleDescriptionBtn}
                    onClick={() => toggleDescription(key)}
                  >
                    {isExpanded ? 'Pokaż mniej' : 'Pokaż więcej'}
                  </button>
                )}

                <div className={styles.btnRow}>
                  {producer.email && (
                    <a
                      href={`mailto:${producer.email}`}
                      onClick={() => {
                        if (producer.id) trackCompanyEvent(producer.id, 'email_click');
                      }}
                    >
                      <button className={styles.contactMeBtn}>Kontakt</button>
                    </a>
                  )}

                  {producer.id && (
                    <Link href={`/zapytania-ofertowe?companyId=${producer.id}`}>
                      <button className={styles.contactMeBtn}>Wycena</button>
                    </Link>
                  )}

                  {producer.www && (
                    <a
                      href={producer.www.startsWith('http') ? producer.www : `https://${producer.www}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        if (producer.id) trackCompanyEvent(producer.id, 'website_click');
                      }}
                    >
                      <button className={`${styles.contactMeBtn} ${styles.ghostBtn}`}>
                        WWW
                      </button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AllProducers;
