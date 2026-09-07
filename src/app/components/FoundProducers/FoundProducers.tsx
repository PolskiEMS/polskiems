"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProducerCard, { type ProducerCardData } from "../ProducerCard/ProducerCard";
import styles from "./styles.module.css";

const SearchContent = () => {
  const [producers, setProducers] = useState<ProducerCardData[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const regions = useMemo(() => searchParams.getAll("regions"), [searchParams]);
  const requirements = useMemo(() => searchParams.getAll("requirements"), [searchParams]);
  const scales = useMemo(() => searchParams.getAll("scales"), [searchParams]);
  const companyTypes = useMemo(() => searchParams.getAll("companyTypes"), [searchParams]);
  const serviceSlugs = useMemo(() => searchParams.getAll("serviceSlugs"), [searchParams]);
  const capabilitySlugs = useMemo(() => searchParams.getAll("capabilitySlugs"), [searchParams]);
  const industrySlugs = useMemo(() => searchParams.getAll("industrySlugs"), [searchParams]);
  const certificationCodes = useMemo(() => searchParams.getAll("certificationCodes"), [searchParams]);
  const searchQuery = searchParams.get("searchQuery") ?? searchParams.get("query") ?? "";
  const sort = searchParams.get("sort") ?? "default";

  const hasSearchCriteria =
    searchQuery.trim().length > 0 ||
    regions.length > 0 ||
    requirements.length > 0 ||
    scales.length > 0 ||
    companyTypes.length > 0 ||
    serviceSlugs.length > 0 ||
    capabilitySlugs.length > 0 ||
    industrySlugs.length > 0 ||
    certificationCodes.length > 0;

  const getProducers = async () => {
    setIsLoading(true);
    setNotFound(false);

    if (!hasSearchCriteria) {
      setProducers([]);
      setNotFound(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/searchProducers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regions,
          requirements,
          scales,
          companyTypes,
          serviceSlugs,
          capabilitySlugs,
          industrySlugs,
          certificationCodes,
          searchQuery,
          sort,
        }),
      });

      if (!response.ok) {
        console.error("searchProducers error:", response.status, await response.text());
        setProducers([]);
        setNotFound(true);
        return;
      }

      const data = await response.json();
      const arr = Array.isArray(data) ? data : [];
      setProducers(arr);
      setNotFound(arr.length === 0);
    } catch (error) {
      console.error("Fetch error:", error);
      setProducers([]);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducers();
  }, [
    regions.join("|"),
    requirements.join("|"),
    scales.join("|"),
    companyTypes.join("|"),
    serviceSlugs.join("|"),
    capabilitySlugs.join("|"),
    industrySlugs.join("|"),
    certificationCodes.join("|"),
    searchQuery,
    sort,
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return <p className={styles.stateMessage}>Ładowanie wyników...</p>;
  }

  return (
    <section className={styles.page} aria-label="Wyniki wyszukiwania producentów">
      {!hasSearchCriteria && (
        <div className={styles.emptyState}>
          <h2>Wybierz kryteria wyszukiwania</h2>
          <p>Wróć do wyszukiwarki i zaznacz przynajmniej jeden filtr albo wpisz frazę, aby zobaczyć dopasowane firmy.</p>
        </div>
      )}

      {producers.length > 0 && (
        <div className={styles.producers}>
          {producers.map((producer, index) => (
            <ProducerCard producer={producer} index={index} key={producer.id ?? `${producer.nazwa}-${index}`} />
          ))}
        </div>
      )}

      {notFound && <p className={styles.stateMessage}>Nie znaleziono producentów dla wybranych kryteriów.</p>}
    </section>
  );
};

const FoundProducers = () => {
  return (
    <Suspense fallback={<p className={styles.stateMessage}>Ładowanie wyników...</p>}>
      <SearchContent />
    </Suspense>
  );
};

export default FoundProducers;
