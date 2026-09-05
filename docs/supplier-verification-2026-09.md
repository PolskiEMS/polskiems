# Supplier verification — September 2026

This file records the source review for the 24 real companies that remained `unclassified` after the initial Supplier Data Model 2026 migration. `PROLine` was intentionally excluded and removed because it was a test record created by the site owner.

The primary rule was: use the company's current official website when possible. Current specialist electronics-industry directories were used only when the official website did not expose enough readable information.

| Company | companyType | Primary verification source | Notes |
|---|---|---|---|
| MASTERS Sp. z o.o. | `component_distributor` | https://www.masters.com.pl/ and https://elektronikab2b.pl/prezentacje/9412-masters-kompleksowy-dostawca-rozwiazan-elektronicznych | Distribution is the primary profile; company also provides engineering/prototype/production services. |
| Lastenic Laser & Electronics | `materials_supplier` | https://elektronikab2b.pl/firmy/13-lastenic | Produces laser-cut SMT stencils and precision metal details for electronics production. |
| JM elektronik Sp. z o.o. | `ems` | https://jm.pl/pl/o-firmie | Explicit EMS/contract electronics manufacturing alongside component distribution. |
| Eltronika | `component_distributor` | https://www.eltronika.pl/marka-eltronika | Authorized component/electromechanical distributor with technical support. |
| CELJAR Elektronik | `ems` | https://www.celjar.pl/ | Explicit EMS, SMT/THT and PCB design. |
| DGTronik Sp. z o.o. | `ems` | https://dgtronik.com.pl/o-nas%2C2%2Cpl | Contract electronics assembly, testing and prototype work. |
| EAE Elektronik Spółka z o.o. | `ems` | https://www.eae-elektronik.pl/ | Full EMS offer: SMT/THT, testing, design, component procurement, coating and EMC. |
| BORNICO Sp. z o.o. | `ems` | https://www.bornico.com.pl/ | Contract electronics assembly plus NPI, cable assembly, electromechanical integration, logistics and service. |
| ME Embedded Sp. z o.o. | `electronics_design` | https://www.me-embedded.eu/projektowanie-produkcja-i-integracja/ | Embedded hardware/software design with prototype/low-volume manufacturing and industrial integration. |
| Printor Sp. z o.o. | `ems` | https://printor.pl/jakosc/ | EMS company; official site confirms ISO 9001 and ISO 13485 and medical PCB/PCBA capability. |
| Rachet Sp. z o.o. | `electronics_design` | https://gpnt.pl/firmy and https://rachet.pl/kontakt | Electronics/software design, product testing and cost optimization are the primary offer. |
| Skalmex Sp. z o.o. | `electronics_manufacturer` | https://skalmex.com.pl/ | Own electronic systems plus external SMT/THT and design services. |
| SOFTCOM Sp. z o.o. | `ems` | https://www.softcom.pl/o_firmie.html | Explicit EMS specialization in assembled modules, PCB and production support. |
| Spółka Inżynierów SIM Sp. z o.o. | `ems` | https://ems.sim.com.pl/ | Contract SMT/THT electronics production, engineering, logistics and software. |
| 7Tech Sp. z o.o. | `electronics_manufacturer` | https://7tech.pl/ | Current company profile states a shift from project work toward own electronic products. |
| ALTEL Wicha, Gołda Sp. J. | `ems` | https://www.altel.pl/ | Contract SMT/THT production, prototypes, electronics design and control-cabinet integration. |
| Altway Electronics | `component_distributor` | https://altway.pl/polityka-prywatnosci | Current business is an electronics/DIY/3D-printing e-commerce distributor rather than EMS. |
| Inteligentna Mikroelektronika Sp. z o.o. (AMC-ESK) | `electronics_manufacturer` | https://www.amc-esk.pl/ | Current official site states AMC-ESK is a brand of Inteligentna Mikroelektronika Sp. z o.o.; old database identity was updated. |
| Andpol Elektronik Sp. z o.o. | `ems` | https://andpol.com.pl/ | Contract SMT/THT, PCB production, design and electrical testing. |
| ARE Jakub Malewicz | `ems` | https://elektronikab2b.pl/firmy/produkcja-elektroniki/uslugi-cem-ems/montaz-smt-tht-oraz-montaz-prototypow/s/21 | Current specialist directory lists SMT/THT, prototypes and cable-harness work; official site was not reliably retrievable. |
| Artronic sp. j. | `ems` | https://elektronikab2b.pl/firmy/produkcja-elektroniki/uslugi-cem-ems/montaz-smt-tht-oraz-montaz-prototypow/s/21 | Current specialist directory lists SMT/THT, prototypes and electronics design; official site was not reliably machine-readable. |
| B.G.-Tronik | `ems` | https://bgtronik.pl/ | Explicit contract SMD/SMT and THT assembly since 2005. |
| Bogart, Dobre Miasto | `ems` | https://www.bogart.pro/ | Official site describes contract supply of electronic/mechanical devices and components, including SMT/THT and engineering. |
| BaZeKo Kociołek & Kociołek sp.j. | `ems` | https://bazeko.pl/o-nas/ | Contract electronics manufacturing with in-house PCB, SMT/THT, component completion, electrical/functional tests and mechanical assembly. |

## Certification handling

Certifications were added only where the current official company source explicitly stated them. Old/outdated certificate claims were not promoted to `verified`.

- JM elektronik: ISO 9001, ISO 14001 — current official site; ISO 9001 certificate valid through 2027.
- EAE Elektronik: ISO 9001, ISO 14001, IATF 16949 — current official site.
- Printor: ISO 9001, ISO 13485 — current official site.
- SIM: ISO 9001 — current official site.
- BaZeKo: ISO 9001 is displayed by the current official site, stored as `listed` rather than `verified` because certificate validity details were not reviewed in this pass.

## Important exclusions

- Bogart's older references to ISO/TS 16949 were not mapped to current IATF 16949.
- Andpol's historical ISO 9001:2000 certificates were not treated as current certification.
- IPC-A-610 process compliance/training claims were not automatically converted into the `IPC-A-610 Class 3` certification taxonomy entry.
