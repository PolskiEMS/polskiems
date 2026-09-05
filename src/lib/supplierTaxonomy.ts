export const TAXONOMY_SECTIONS = [
  {
    key: "company_type",
    label: "Typ firmy",
    description: "Czym jest dostawca: EMS, producent PCB, biuro projektowe, dystrybutor komponentów itd.",
  },
  {
    key: "services",
    label: "Usługi",
    description: "Co firma wykonuje dla klienta.",
  },
  {
    key: "capabilities",
    label: "Możliwości technologiczne",
    description: "Jakie procesy, technologie i zaplecze posiada firma.",
  },
  {
    key: "industries",
    label: "Branże",
    description: "Dla jakich sektorów firma pracuje.",
  },
  {
    key: "certifications",
    label: "Certyfikaty i standardy",
    description: "Normy, certyfikaty i standardy jakości deklarowane lub potwierdzone dla firmy.",
  },
  {
    key: "production_scale",
    label: "Skala produkcji",
    description: "Zakres produkcji obsługiwany przez firmę.",
  },
  {
    key: "location",
    label: "Lokalizacja",
    description: "Województwo i dane lokalizacyjne firmy.",
  },
] as const;

export const COMPANY_TYPE_LABELS = {
  unclassified: "Nieprzypisane",
  ems: "EMS / producent kontraktowy elektroniki",
  pcb_manufacturer: "Producent PCB",
  electronics_manufacturer: "Producent elektroniki własnej",
  electronics_design: "Biuro projektowania elektroniki",
  cable_wire_harness: "Producent kabli i wiązek",
  box_build_system_integration: "Box Build / integrator urządzeń",
  testing_laboratory: "Laboratorium testowe",
  component_manufacturer: "Producent komponentów",
  component_distributor: "Dystrybutor komponentów",
  materials_supplier: "Dostawca materiałów",
  equipment_consulting: "Dostawca maszyn / doradztwo technologiczne",
} as const;

export type CompanyType = keyof typeof COMPANY_TYPE_LABELS;

export type TaxonomyTargetSection = "services" | "capabilities" | "industries" | "certifications";

export type LegacyServiceMapping = {
  legacyName: string;
  targetSection: TaxonomyTargetSection;
  targetKey: string;
  targetLabel: string;
  note?: string;
};

export const LEGACY_SERVICE_MAPPINGS: LegacyServiceMapping[] = [
  {
    legacyName: "Projekt",
    targetSection: "services",
    targetKey: "design_support",
    targetLabel: "Projektowanie elektroniki / wsparcie DFM",
  },
  {
    legacyName: "Dostarcza PCB",
    targetSection: "services",
    targetKey: "pcb_sourcing",
    targetLabel: "Dostawa PCB",
  },
  {
    legacyName: "Dostarcza komponenty",
    targetSection: "services",
    targetKey: "component_procurement",
    targetLabel: "Zakup / kompletacja komponentów",
  },
  {
    legacyName: "Kupuje komponenty",
    targetSection: "services",
    targetKey: "component_procurement",
    targetLabel: "Zakup / kompletacja komponentów",
  },
  {
    legacyName: "Montaż SMD",
    targetSection: "services",
    targetKey: "smt_assembly",
    targetLabel: "Montaż SMT / SMD",
  },
  {
    legacyName: "Montaż SMT",
    targetSection: "services",
    targetKey: "smt_assembly",
    targetLabel: "Montaż SMT / SMD",
  },
  {
    legacyName: "Montaż THT",
    targetSection: "services",
    targetKey: "tht_assembly",
    targetLabel: "Montaż THT",
  },
  {
    legacyName: "Inspekcja",
    targetSection: "capabilities",
    targetKey: "quality_control",
    targetLabel: "Kontrola jakości",
    note: "Ogólna inspekcja nie musi oznaczać AOI/SPI/X-Ray — szczegółowe możliwości powinny być potwierdzane osobno.",
  },
  {
    legacyName: "Test Flying Probe",
    targetSection: "capabilities",
    targetKey: "flying_probe",
    targetLabel: "Test Flying Probe",
  },
  {
    legacyName: "Test funkcjonalny",
    targetSection: "capabilities",
    targetKey: "functional_testing",
    targetLabel: "Test funkcjonalny",
  },
  {
    legacyName: "Montaż obudowy",
    targetSection: "services",
    targetKey: "box_build",
    targetLabel: "Box Build / montaż urządzeń",
  },
  {
    legacyName: "Montaż produktu finalnego",
    targetSection: "services",
    targetKey: "box_build",
    targetLabel: "Box Build / montaż urządzeń",
  },
  {
    legacyName: "Conformal Coating",
    targetSection: "capabilities",
    targetKey: "conformal_coating",
    targetLabel: "Conformal coating / lakierowanie PCB",
  },
  {
    legacyName: "Mycie płytek",
    targetSection: "capabilities",
    targetKey: "pcb_cleaning",
    targetLabel: "Mycie PCB",
  },
  {
    legacyName: "Lakierowanie",
    targetSection: "capabilities",
    targetKey: "conformal_coating",
    targetLabel: "Conformal coating / lakierowanie PCB",
  },
  {
    legacyName: "Hermetyzacja",
    targetSection: "capabilities",
    targetKey: "potting",
    targetLabel: "Hermetyzacja / zalewanie",
  },
  {
    legacyName: "IPC Klasa 1",
    targetSection: "certifications",
    targetKey: "IPC-A-610-CLASS-1",
    targetLabel: "IPC-A-610 Class 1",
  },
  {
    legacyName: "IPC Klasa 2",
    targetSection: "certifications",
    targetKey: "IPC-A-610-CLASS-2",
    targetLabel: "IPC-A-610 Class 2",
  },
  {
    legacyName: "IPC Klasa 3",
    targetSection: "certifications",
    targetKey: "IPC-A-610-CLASS-3",
    targetLabel: "IPC-A-610 Class 3 – wysoka niezawodność",
  },
  {
    legacyName: "Umożliwia audyt",
    targetSection: "capabilities",
    targetKey: "process_audit",
    targetLabel: "Możliwość audytu procesu",
  },
];

export const LEGACY_SERVICE_MAPPING_BY_NAME = Object.fromEntries(
  LEGACY_SERVICE_MAPPINGS.map((mapping) => [mapping.legacyName, mapping])
) as Record<string, LegacyServiceMapping>;
