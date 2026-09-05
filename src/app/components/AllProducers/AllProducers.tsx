'use client';

import ProducerCard, { type ProducerCardData } from '../ProducerCard/ProducerCard';
import styles from './styles.module.css';

const AllProducers = ({ producers }: { producers: ProducerCardData[] }) => {
  return (
    <section className={styles.page} aria-label="Lista producentów EMS">
      <div className={styles.producers}>
        {producers.map((producer, index) => (
          <ProducerCard producer={producer} index={index} key={producer.id ?? `${producer.nazwa}-${index}`} />
        ))}
      </div>
    </section>
  );
};

export default AllProducers;
