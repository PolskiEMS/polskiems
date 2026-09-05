# PolskiEMS — cleanup taksonomii dostawców po polsku

## Cel

Ujednolicić dane producentów i dostawców tak, aby PolskiEMS nie był jedną długą listą checkboxów, tylko uporządkowaną platformą B2B.

Docelowy podział:

1. **Typ firmy** — czym jest dostawca.
2. **Usługi** — co firma wykonuje.
3. **Możliwości technologiczne** — jakimi procesami, technologiami i zapleczem firma dysponuje.
4. **Branże** — dla jakich sektorów firma pracuje.
5. **Certyfikaty i standardy** — jakie normy, certyfikaty i standardy jakości deklaruje lub posiada.
6. **Skala produkcji** — jaki zakres produkcji obsługuje.
7. **Lokalizacja** — województwo i dane lokalizacyjne.

## Etap 1 — polskie nazwy docelowe

### Typ firmy

| Wartość techniczna | Nazwa w UI |
|---|---|
| `unclassified` | Nieprzypisane |
| `ems` | EMS / producent kontraktowy elektroniki |
| `pcb_manufacturer` | Producent PCB |
| `electronics_manufacturer` | Producent elektroniki własnej |
| `electronics_design` | Biuro projektowania elektroniki |
| `cable_wire_harness` | Producent kabli i wiązek |
| `box_build_system_integration` | Box Build / integrator urządzeń |
| `testing_laboratory` | Laboratorium testowe |
| `component_manufacturer` | Producent komponentów |
| `component_distributor` | Dystrybutor komponentów |
| `materials_supplier` | Dostawca materiałów |
| `equipment_consulting` | Dostawca maszyn / doradztwo technologiczne |

### Usługi

| Klucz | Nazwa w UI |
|---|---|
| `smt_assembly` | Montaż SMT / SMD |
| `tht_assembly` | Montaż THT |
| `mixed_technology` | Montaż mieszany SMT + THT |
| `pcb_assembly` | Montaż PCB |
| `box_build` | Box Build / montaż urządzeń |
| `cable_assembly` | Montaż kabli i wiązek |
| `prototype_assembly` | Prototypowanie elektroniki |
| `npi` | NPI / uruchomienie nowego produktu |
| `design_support` | Projektowanie elektroniki / wsparcie DFM |
| `component_procurement` | Zakup / kompletacja komponentów |
| `pcb_sourcing` | Dostawa PCB |
| `testing` | Testowanie elektroniki |
| `programming` | Programowanie układów |
| `repair_rework` | Serwis / naprawa / rework |
| `electromechanical_assembly` | Montaż elektromechaniczny |
| `supply_chain_management` | Zarządzanie łańcuchem dostaw |

### Możliwości technologiczne

| Klucz | Nazwa w UI |
|---|---|
| `aoi` | Inspekcja AOI |
| `spi` | Inspekcja SPI |
| `x_ray` | Inspekcja X-Ray |
| `bga` | Montaż BGA |
| `fine_pitch` | Montaż fine pitch |
| `flying_probe` | Test Flying Probe |
| `ict` | Test ICT |
| `functional_testing` | Test funkcjonalny |
| `selective_soldering` | Lutowanie selektywne |
| `wave_soldering` | Lutowanie na fali |
| `conformal_coating` | Conformal coating / lakierowanie PCB |
| `pcb_cleaning` | Mycie PCB |
| `potting` | Hermetyzacja / zalewanie |
| `traceability` | Traceability / identyfikowalność produkcji |
| `cleanroom` | Cleanroom / strefa czysta |
| `quality_control` | Kontrola jakości |
| `process_audit` | Możliwość audytu procesu |

### Branże

| Klucz | Nazwa w UI |
|---|---|
| `automotive` | Motoryzacja |
| `defence` | Obronność / High-Reliability |
| `medical` | Medycyna |
| `industrial` | Przemysł |
| `aerospace` | Lotnictwo / Aerospace |
| `rail` | Kolej |
| `telecom` | Telekomunikacja |
| `energy` | Energetyka |
| `iot` | IoT |
| `consumer_electronics` | Elektronika użytkowa |
| `robotics` | Robotyka |

### Certyfikaty i standardy

| Kod | Nazwa w UI |
|---|---|
| `ISO-9001` | ISO 9001 – zarządzanie jakością |
| `ISO-13485` | ISO 13485 – wyroby medyczne |
| `IATF-16949` | IATF 16949 – motoryzacja |
| `ISO-14001` | ISO 14001 – zarządzanie środowiskowe |
| `ISO-45001` | ISO 45001 – BHP |
| `AQAP-2110` | AQAP 2110 – obronność |
| `AS9100` | AS9100 – lotnictwo i kosmos |
| `AS9120` | AS9120 – dystrybucja lotnicza |
| `IPC-A-610-CLASS-1` | IPC-A-610 Class 1 |
| `IPC-A-610-CLASS-2` | IPC-A-610 Class 2 |
| `IPC-A-610-CLASS-3` | IPC-A-610 Class 3 – wysoka niezawodność |
| `J-STD-001` | J-STD-001 – wymagania lutowania |

### Skala produkcji

| Nazwa w UI |
|---|
| Prototypy (1–10 szt.) |
| Małe serie (11–50 szt.) |
| Średnie serie (51–250 szt.) |
| Duże serie (251–1000 szt.) |
| Produkcja masowa (1000+ szt.) |

## Etap 2 — mapowanie starego modelu usług

| Stara nazwa | Docelowa sekcja | Docelowa pozycja |
|---|---|---|
| Projekt | Usługi | Projektowanie elektroniki / wsparcie DFM |
| Dostarcza PCB | Usługi | Dostawa PCB |
| Dostarcza komponenty | Usługi | Zakup / kompletacja komponentów |
| Kupuje komponenty | Usługi | Zakup / kompletacja komponentów |
| Montaż SMD | Usługi | Montaż SMT / SMD |
| Montaż SMT | Usługi | Montaż SMT / SMD |
| Montaż THT | Usługi | Montaż THT |
| Inspekcja | Możliwości technologiczne | Kontrola jakości |
| Test Flying Probe | Możliwości technologiczne | Test Flying Probe |
| Test funkcjonalny | Możliwości technologiczne | Test funkcjonalny |
| Montaż obudowy | Usługi | Box Build / montaż urządzeń |
| Montaż produktu finalnego | Usługi | Box Build / montaż urządzeń |
| Conformal Coating | Możliwości technologiczne | Conformal coating / lakierowanie PCB |
| Mycie płytek | Możliwości technologiczne | Mycie PCB |
| Lakierowanie | Możliwości technologiczne | Conformal coating / lakierowanie PCB |
| Hermetyzacja | Możliwości technologiczne | Hermetyzacja / zalewanie |
| IPC Klasa 1 | Certyfikaty i standardy | IPC-A-610 Class 1 |
| IPC Klasa 2 | Certyfikaty i standardy | IPC-A-610 Class 2 |
| IPC Klasa 3 | Certyfikaty i standardy | IPC-A-610 Class 3 – wysoka niezawodność |
| Umożliwia audyt | Możliwości technologiczne | Możliwość audytu procesu |

## Etap 3 — admin

W panelu edycji firmy należy dodać osobne sekcje:

- Typ firmy
- Usługi
- Możliwości technologiczne
- Branże
- Certyfikaty i standardy
- Skala produkcji
- Lokalizacja

Stary model `dzialania_ems` powinien zostać jeszcze jako kompatybilność przejściowa, dopóki wyszukiwarka i RFQ nie zostaną przepięte w pełni na nowy model.

## Etap 4 — profil firmy

Profil producenta powinien pokazywać osobno:

- Opis firmy
- Typ firmy
- Usługi
- Możliwości technologiczne
- Branże
- Certyfikaty i standardy
- Skala produkcji
- Lokalizacja i kontakt

## Etap 5 — wyszukiwarka

Wyszukiwarka powinna przejść z jednej listy `requirements` na osobne grupy filtrów:

- Usługi
- Możliwości technologiczne
- Branże
- Certyfikaty i standardy
- Typ firmy
- Lokalizacja
- Skala produkcji

## Etap 6 — Supabase

W Supabase sekcje są uporządkowane przez:

- `taxonomy_sections`
- `services`
- `capabilities`
- `industries`
- `certifications`
- `produkcja`
- pole `companyType` w `producenci`

Stabilne wartości techniczne pozostają jako slugi/kody. Publicznie w UI pokazujemy polskie nazwy.
