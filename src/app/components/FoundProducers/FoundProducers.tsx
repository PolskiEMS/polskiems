'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './styles.module.css';
import { trackCompanyEvent } from '@/lib/trackCompanyEvent';

type Producer = {
  id?: number;
  nazwa: string;
  featured?: boolean | null;
  packageType?: string | null;
};

const SearchContent = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const openProducerProfile = (producerId?: number) => {
    if (producerId) router.push(`/producenci/${producerId}`);
  };

  const regions = searchParams.getAll('regions');
  const requirements = searchParams.getAll('requirements');
  const scales = searchParams.getAll('scales');
  const searchQuery = searchParams.get('searchQuery') ?? searchParams.get('query') ?? '';
  const sort = searchParams.get('sort') ?? 'default';

  const getProducers = async () => {
    setIsLoading(true);
    setNotFound(false);

    try {
      const response = await fetch('/api/searchProducers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regions, requirements, scales, searchQuery, sort }),
      });

      if (!response.ok) {
        console.error('searchProducers error:', response.status, await response.text());
        setProducers([]);
        setNotFound(true);
        return;
      }

      const data = await response.json();
      const arr = Array.isArray(data) ? data : [];
      setProducers(arr);
      setNotFound(arr.length === 0);
    } catch (error) {
      console.error('Fetch error:', error);
      setProducers([]);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducers();
  }, [regions.join('|'), requirements.join('|'), scales.join('|'), searchQuery, sort]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.page}>
      {!isLoading ? (
        <div>
          {producers.length > 0 && (
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
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  onViewportEnter={() => {
                    if (producer.id) trackCompanyEvent(producer.id, 'view');
                  }}
                  role={producer.id ? 'link' : undefined}
                  tabIndex={producer.id ? 0 : undefined}
                  aria-label={producer.id ? `Otwórz profil producenta ${producer.nazwa}` : undefined}
                  onClick={() => openProducerProfile(producer.id)}
                  onKeyDown={(event) => {
                    if (producer.id && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      openProducerProfile(producer.id);
                    }
                  }}
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
          )}

          {notFound && <p className={styles.notFound}>Nie znaleziono takich producentów</p>}
          {!notFound && producers.length === 0 && <div style={{ marginBottom: '420px' }} />}
        </div>
      ) : (
        <p className={styles.notFound}>Ładowanie...</p>
      )}
    </div>
  );
};

const FoundProducers = () => {
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <SearchContent />
    </Suspense>
  );
};

export default FoundProducers;
