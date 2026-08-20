'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import styles from './styles.module.css';
import { trackCompanyEvent } from '@/lib/trackCompanyEvent';
import { companyProfileSlug } from '@/lib/companySlug';

type Producer = {
  id?: number;
  nazwa: string;
  featured?: boolean | null;
  packageType?: string | null;
};

const AllProducers = ({ producers }: { producers: Producer[] }) => {
  const router = useRouter();

  const openProducerProfile = (producerName: string, producerId?: number) => {
    if (producerId) {
      router.push(`/producenci/${companyProfileSlug(producerName, producerId)}`);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.producers}>
        {producers.map((producer, i) => (
          <motion.div
            className={`${styles.producerBlock} ${
              producer.packageType === 'premium'
                ? styles.premiumBlock
                : producer.packageType === 'standard'
                  ? styles.standardBlock
                  : ''
            }`}
            key={producer.id ?? i}
            id={producer.id ? `producent-${producer.id}` : undefined}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            onViewportEnter={() => {
              if (producer.id) trackCompanyEvent(producer.id, 'view');
            }}
            onClick={() => openProducerProfile(producer.nazwa, producer.id)}
            onKeyDown={(event) => {
              if (producer.id && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                openProducerProfile(producer.nazwa, producer.id);
              }
            }}
            role={producer.id ? 'link' : undefined}
            tabIndex={producer.id ? 0 : undefined}
            aria-label={producer.id ? `Otwórz profil producenta ${producer.nazwa}` : undefined}
            transition={{ duration: 1.2, delay: i <= 2 ? 0.3 * i : 0.3 }}
          >
            <div className={styles.divToMove}>
              <Image
                src={`/images/producers/${producer.nazwa}.jpg`}
                width={210}
                height={210}
                alt={`Producent ${producer.nazwa}`}
              />

              {producer.featured && (
                <div className={styles.featuredBadge}>Polecany Producent</div>
              )}

              <h2>{producer.nazwa}</h2>

              {producer.id && (
                <Link
                  href={`/zapytania-ofertowe?companyId=${producer.id}&source=company_card`}
                  className={styles.contactMeBtn}
                  onClick={(event) => event.stopPropagation()}
                >
                  Poproś o wycenę
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AllProducers;
