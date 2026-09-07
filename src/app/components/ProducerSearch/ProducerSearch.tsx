"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicSupplierSearchOptions } from "@/lib/publicSupplierTaxonomyActions";
import styles from "./styles.module.css";

type FilterCategory =
  | "regions"
  | "companyTypes"
  | "serviceSlugs"
  | "capabilitySlugs"
  | "industrySlugs"
  | "certificationCodes"
  | "scales";

type SortOption = "default" | "name-asc" | "name-desc" | "newest" | "oldest";

type FilterItem = {
  label: string;
  value: string;
};

type SelectedFilters = Record<FilterCategory, string[]>;

type ProducerSearchProps = {
  options: PublicSupplierSearchOptions;
};

const emptyFilters: SelectedFilters = {
  regions: [],
  companyTypes: [],
  serviceSlugs: [],
  capabilitySlugs: [],
  industrySlugs: [],
  certificationCodes: [],
  scales: [],
};

const ProducerSearch = ({ options }: ProducerSearchProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("default");
  const [searchError, setSearchError] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(emptyFilters);

  const filtersData = useMemo<Record<FilterCategory, FilterItem[]>>(() => ({
    regions: options.regions.map((region) => ({ label: region.nazwa, value: region.nazwa })),
    companyTypes: options.companyTypes.map((type) => ({ label: type.label, value: type.value })),
    serviceSlugs: options.services.map((service) => ({ label: service.name, value: service.slug })),
    capabilitySlugs: options.capabilities.map((capability) => ({ label: capability.name, value: capability.slug })),
    industrySlugs: options.industries.map((industry) => ({ label: industry.name, value: industry.slug })),
    certificationCodes: options.certifications.map((certification) => ({
      label: certification.name,
      value: certification.code,
    })),
    scales: options.productionScales.map((scale) => ({ label: scale.zakres, value: scale.zakres })),
  }), [options]);

  const hasSearchCriteria =
    searchQuery.trim().length > 0 ||
    Object.values(selectedFilters).some((values) => values.length > 0);

  const toggleFilter = (category: FilterCategory, value: string) => {
    setSearchError("");
    setSelectedFilters((prev) => {
      const alreadySelected = prev[category].includes(value);
      const updated = alreadySelected
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value];

      return { ...prev, [category]: updated };
    });
  };

  const selectAll = (category: FilterCategory) => {
    setSearchError("");
    setSelectedFilters((prev) => {
      const categoryValues = filtersData[category].map((item) => item.value);
      const allSelected = categoryValues.every((item) => prev[category].includes(item));

      return {
        ...prev,
        [category]: allSelected ? [] : categoryValues,
      };
    });
  };

  const handleSearch = () => {
    if (!hasSearchCriteria) {
      setSearchError("Wybierz co najmniej jeden filtr albo wpisz frazę wyszukiwania.");
      return;
    }

    const params = new URLSearchParams();
    Object.entries(selectedFilters).forEach(([category, values]) => {
      values.forEach((value) => params.append(category, value));
    });

    const trimmedSearchQuery = searchQuery.trim();
    if (trimmedSearchQuery) params.set("searchQuery", trimmedSearchQuery);
    if (sort !== "default") params.set("sort", sort);

    router.push(`/producenci?${params.toString()}`);
  };

  const renderFilterGroup = (title: string, description: string, category: FilterCategory, items: FilterItem[]) => {
    const selectedCount = selectedFilters[category].length;

    return (
      <section className={styles.filterGroup}>
        <div className={styles.filterHeader}>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <span>{selectedCount ? `${selectedCount} wybrane` : "Opcjonalnie"}</span>
        </div>

        {items.length > 0 ? (
          <>
            <button
              type="button"
              className={styles.selectAllBtn}
              onClick={() => selectAll(category)}
            >
              {selectedCount === items.length ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
            </button>
            <div className={styles.oneGroup}>
              {items.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => toggleFilter(category, item.value)}
                  className={selectedFilters[category].includes(item.value) ? styles.clicked : styles.noClicked}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className={styles.emptyGroup}>Brak aktywnych opcji w tej sekcji.</p>
        )}
      </section>
    );
  };

  return (
    <section className={styles.searchBox} aria-label="Wyszukiwarka producentów EMS">
      <div className={styles.searchControls}>
        <label className={styles.controlLabel}>
          <span>Szukaj producentów</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => {
              setSearchError("");
              setSearchQuery(event.target.value);
            }}
            placeholder="Np. AOI, ISO 9001, medical, box build, nazwa firmy"
            className={styles.searchInput}
          />
        </label>
        <label className={styles.controlLabel}>
          <span>Sortuj wyniki</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className={styles.sortSelect}
          >
            <option value="default">Najtrafniejsze</option>
            <option value="name-asc">Nazwa A-Z</option>
            <option value="name-desc">Nazwa Z-A</option>
            <option value="newest">Najnowsze</option>
            <option value="oldest">Najstarsze</option>
          </select>
        </label>
      </div>

      <div className={styles.allFiltersGroup}>
        {renderFilterGroup("Typ firmy", "Określ, czy szukasz EMS, producenta PCB, biura projektowego lub dystrybutora.", "companyTypes", filtersData.companyTypes)}
        {renderFilterGroup("Usługi", "Co firma ma wykonać dla projektu.", "serviceSlugs", filtersData.serviceSlugs)}
        {renderFilterGroup("Możliwości technologiczne", "Technologie, procesy, testy i zaplecze jakościowe.", "capabilitySlugs", filtersData.capabilitySlugs)}
        {renderFilterGroup("Branże", "Doświadczenie w sektorach takich jak automotive, medical, defence czy industrial.", "industrySlugs", filtersData.industrySlugs)}
        {renderFilterGroup("Certyfikaty i standardy", "Normy jakości i standardy wykonania ważne przy projektach B2B.", "certificationCodes", filtersData.certificationCodes)}
        {renderFilterGroup("Lokalizacja", "Wybierz województwo lub kilka regionów.", "regions", filtersData.regions)}
        {renderFilterGroup("Skala produkcji", "Dopasuj producenta do prototypów, serii lub produkcji masowej.", "scales", filtersData.scales)}
      </div>

      <div className={styles.buttons}>
        {searchError && <p className={styles.searchError}>{searchError}</p>}
        <button
          type="button"
          className={`${styles.searchButton} ${!hasSearchCriteria ? styles.searchButtonDisabled : ""}`}
          onClick={handleSearch}
          aria-disabled={!hasSearchCriteria}
        >
          Wyszukaj producenta
        </button>
        <Link href="/wszyscy-producenci" className={styles.allProducentsBtn}>Pokaż wszystkie firmy</Link>
        <Link href="/dodaj-producenta" className={styles.companySignupBtn}>Dodaj firmę EMS</Link>
      </div>
    </section>
  );
};

export default ProducerSearch;
