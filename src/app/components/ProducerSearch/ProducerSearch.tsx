'use client'
import { useState } from 'react';
import styles from './styles.module.css'
import Link from 'next/link';

type FilterCategory = "regions" | "requirements" | "scales";

const filtersData = {
    regions: [
        "dolnośląskie", "kujawsko–pomorskie", "lubelskie", "lubuskie", "łódzkie",
        "małopolskie", "mazowieckie", "opolskie", "podkarpackie", "podlaskie",
        "pomorskie", "śląskie", "świętokrzyskie", "warmińsko-mazurskie",
        "wielkopolskie", "zachodniopomorskie"
    ],
    requirements: [
        "Projekt", "Dostarcza PCB", "Kupuje komponenty", "Montaż SMD", "Montaż THT",
        "Inspekcja", "Test Flying Probe", "Test funkcjonalny", "Montaż obudowe",
        "Montaż produktu finalnego", "Conformal Coating", "Lakierowanie",
        "Hermetyzacja", "IPC Klasa 3", "IPC Klasa 2", "IPC Klasa 1", "Umożliwia audyt"
    ],
    scales: [
        "1 - 10", "10 - 50", "50 - 200", "200 - 1000", "1000 +", "Umowa kontrakowa"
    ]
};

const ProducerSearch = () => {
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

            let updated;

            updated = alreadySelected
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
                        className={styles.buttons}
                        onClick={saveStatistics}>
                        <Link href={{
                            pathname: '/producenci',
                            query: {
                                regions: selectedFilters.regions,
                                requirements: selectedFilters.requirements,
                                scales: selectedFilters.scales
                            }
                        }} className={styles.searchBtn}><button>Wyszukaj</button></Link>
                        <Link href={'/wszyscy-producenci'} className={styles.allProducentsBtn}><button>Wszyscy Producenci</button></Link>
                        <Link href={'formularz_zgloszeniowy_firmy.docx'}><button className={styles.chceZnalezcSie}>Chcę znaleźć się na stronie</button></Link>
                    </div>
                }
            </div>
        </div>
    );

    const saveStatistics = async () => {
        const encodeBinary = (category: FilterCategory) => {
            return filtersData[category]
                .map(option => selectedFilters[category].includes(option) ? '1' : '0')
                .join(',');
        };

        const binaryRegions = encodeBinary('regions');
        const binaryRequirements = encodeBinary('requirements');
        const binaryScales = encodeBinary('scales');

        const binaryStats = `${binaryRegions},${binaryRequirements},${binaryScales}`;

        const response = await fetch('/api/saveStatistics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stats: binaryStats })
        });

        const data = await response.json();
    }

    return (
        <div>
            <div className={styles.allFiltersGroup}>
                {renderFilterGroup("Region", "regions", filtersData.regions)}
                {renderFilterGroup("Wymagania", "requirements", filtersData.requirements)}
                {renderFilterGroup("Skala produkcji", "scales", filtersData.scales)}
            </div>
        </div >
    );
};

export default ProducerSearch;