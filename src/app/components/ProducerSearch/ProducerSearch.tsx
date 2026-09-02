'use client'
import { useState } from 'react';
import styles from './styles.module.css'
import Link from 'next/link';
import { SERVICES } from '@/lib/services';

type FilterCategory = "regions" | "requirements" | "scales";
type SortOption = "default" | "name-asc" | "name-desc" | "newest" | "oldest";

const filtersData = {
    regions: [
        "dolnośląskie", "kujawsko–pomorskie", "lubelskie", "lubuskie", "łódzkie",
        "małopolskie", "mazowieckie", "opolskie", "podkarpackie", "podlaskie",
        "pomorskie", "śląskie", "świętokrzyskie", "warmińsko-mazurskie",
        "wielkopolskie", "zachodniopomorskie"
    ],
    requirements: [...SERVICES],
    scales: [
        "1 - 10", "10 - 50", "50 - 200", "200 - 1000", "1000 +", "Umowa kontrakowa"
    ]
};

const ProducerSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState<SortOption>('default');
    const [selectedFilters, setSelectedFilters] = useState<{
        regions: string[];
        requirements: string[];
        scales: string[];
    }>({
        regions: [],
        requirements: [],
        scales: []
    });

    const toggleFilter = (category: FilterCategory, value: string) => {
        setSelectedFilters(prev => {
            const alreadySelected = prev[category].includes(value);

            const updated = alreadySelected
                ? prev[category].filter(item => item !== value)
                : [...prev[category], value];

            return { ...prev, [category]: updated };
        });
    };

    const selectAll = (category: FilterCategory) => {
        setSelectedFilters(prev => {
            const allSelected = filtersData[category].every(item => prev[category].includes(item));

            return {
                ...prev,
                [category]: allSelected ? [] : filtersData[category]
            };
        });
    };


    const renderFilterGroup = (title: string, category: FilterCategory, items: string[]) => (
        <div>
            <h3>{title}</h3>
            <button
                className={styles.selectAllBtn}
                onClick={() => selectAll(category)}
            >
                Zaznacz wszystkie
            </button>
            <div className={styles.oneGroup}>
                {items.map(item => (
                    <button
                        key={item}
                        onClick={() => toggleFilter(category, item)}
                        className={` ${selectedFilters[category].includes(item)
                            ? `${styles.clicked}`
                            : `${styles.noClicked}`
                            }`}
                    >
                        {item}
                    </button>
                ))}
                {
                    category === 'scales' &&
                    <div
                        className={styles.buttons}>
                        <Link href={{
                            pathname: '/producenci',
                            query: {
                                regions: selectedFilters.regions,
                                requirements: selectedFilters.requirements,
                                scales: selectedFilters.scales,
                                searchQuery: searchQuery.trim() || undefined,
                                sort
                            }
                        }} className={styles.searchBtn}><button>Wyszukaj</button></Link>
                        <Link href={'/wszyscy-producenci'} className={styles.allProducentsBtn}><button>Wszyscy Producenci</button></Link>
                        <Link href={'/dodaj-producenta'}><button className={styles.chceZnalezcSie}>Dodaj firmę EMS</button></Link>
                    </div>
                }
            </div>
        </div>
    );


    return (
        <div>
            <div className={styles.searchControls}>
                <label className={styles.controlLabel}>
                    <span>Szukaj producentów</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Szukaj po nazwie, opisie lub usługach"
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
                        <option value="default">Domyślnie</option>
                        <option value="name-asc">Nazwa A-Z</option>
                        <option value="name-desc">Nazwa Z-A</option>
                        <option value="newest">Najnowsze</option>
                        <option value="oldest">Najstarsze</option>
                    </select>
                </label>
            </div>
            <div className={styles.allFiltersGroup}>
                {renderFilterGroup("Region", "regions", filtersData.regions)}
                {renderFilterGroup("Usługi EMS", "requirements", filtersData.requirements)}
                {renderFilterGroup("Skala produkcji", "scales", filtersData.scales)}
            </div>
        </div >
    );
};

export default ProducerSearch;
