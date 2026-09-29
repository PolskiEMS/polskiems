# PolskiEMS

PolskiEMS to polska platforma B2B dla branży produkcji elektroniki. Łączy firmy szukające wykonawców i dostawców z producentami EMS, PCB, elektroniką, firmami box build, dostawcami technologii oraz innymi podmiotami działającymi w łańcuchu dostaw elektroniki.

Projekt rozwijany jest jako połączenie katalogu firm, wyszukiwarki branżowej, systemu RFQ, modułu dopasowania dostawców oraz narzędzi analitycznych dla producentów.

## Główne cele

- ułatwienie firmom znalezienia producenta lub dostawcy w Polsce,
- skrócenie czasu potrzebnego na sourcing i porównywanie wykonawców,
- zwiększenie widoczności polskich producentów,
- wspieranie lokalnych łańcuchów dostaw,
- łączenie firm na podstawie rzeczywistych kompetencji technologicznych,
- rozwój PolskiEMS w kierunku platformy B2B sourcing & matchmaking.

## Najważniejsze funkcje

### Katalog producentów

Profile firm zawierają m.in.:

- typ firmy,
- dane kontaktowe,
- lokalizację,
- usługi,
- możliwości technologiczne,
- obsługiwane branże,
- certyfikaty,
- skalę produkcji,
- link do strony WWW.

Wyszukiwarka wykorzystuje wspólną taksonomię danych, dzięki czemu firmy można filtrować według ich rzeczywistych kompetencji.

### RFQ — zapytania ofertowe

Klient może:

1. wskazać konkretną firmę,
2. pozostawić dobór wykonawcy systemowi PolskiEMS.

Formularz RFQ zbiera m.in.:

- wymagane usługi,
- możliwości technologiczne,
- branżę,
- certyfikaty,
- skalę produkcji,
- preferowaną lokalizację,
- ilość,
- termin,
- opis projektu,
- dokumentację techniczną.

System przygotowuje kandydatów na podstawie zgodności danych firmy z wymaganiami projektu. Zapytania trafiają najpierw do weryfikacji administratora.

### Automatyczne dopasowanie firm

Aktualny model scoringu RFQ wykorzystuje:

- usługi,
- możliwości technologiczne,
- branże,
- certyfikaty,
- skalę produkcji,
- lokalizację.

Pakiet firmy może być wykorzystany jako kryterium pomocnicze przy podobnym dopasowaniu, ale nie zastępuje zgodności technicznej.

### Onboarding firm

Strona `/dodaj-producenta` pozwala zgłosić nową firmę do katalogu.

Nowa firma może podać:

- typ działalności,
- dane kontaktowe,
- usługi,
- technologie,
- branże,
- certyfikaty,
- skalę produkcji,
- lokalizację,
- wybrany pakiet.

Każde nowe zgłoszenie trafia do weryfikacji przed publikacją.

### Pakiety

PolskiEMS działa w modelu freemium.

#### FREE

- 0 zł,
- podstawowa obecność w katalogu,
- podstawowy profil,
- do 5 RFQ miesięcznie.

#### STANDARD

- 199 zł / miesiąc,
- pełny profil,
- większa widoczność,
- wyróżniona karta,
- do 20 RFQ miesięcznie,
- miesięczny raport skuteczności,
- statystyki wyświetleń i kliknięć.

#### PREMIUM

- 299 zł / miesiąc,
- pełny i wyróżniony profil,
- najwyższy priorytet w domyślnym katalogu,
- nielimitowane RFQ,
- rozszerzona analityka,
- CTR,
- potencjał leadowy,
- rekomendacje optymalizacji.

Ceny i limity są utrzymywane centralnie w:

```
src/lib/packagePlans.ts
```

### Raporty PDF

Dla pakietów Standard i Premium generowane są raporty PDF zawierające m.in.:

- wyświetlenia profilu,
- kliknięcia WWW,
- kliknięcia e-mail,
- liczbę przekazanych RFQ,
- CTR,
- dodatkową analitykę dla Premium,
- rekomendacje dotyczące profilu.

Raporty miesięczne mogą być wysyłane automatycznie.

## Model biznesowy

Obecny model PolskiEMS:

- użytkownik szukający producenta korzysta z platformy bezpłatnie,
- producenci mogą korzystać z profilu Free,
- przychód generują płatne pakiety Standard i Premium.

Docelowo model może zostać rozszerzony o:

- sourcing lokalnych dostawców,
- business matchmaking,
- kwalifikowane leady,
- aktywne wsparcie sprzedażowe,
- success fee,
- pośrednictwo producent ↔ producent,
- pośrednictwo klient ↔ producent,
- lokalizację łańcuchów dostaw.

## Kierunek rozwoju

PolskiEMS ma rozwijać się z katalogu firm w stronę:

> platformy B2B łączącej firmy poszukujące produkcji elektroniki, dostawców i partnerów technologicznych w Polsce.

Planowane lub rozwijane obszary:

- RFQ scoring i panel wyboru firm,
- sourcing lokalny,
- Partner Network,
- market intelligence,
- aktualności branżowe,
- sygnały biznesowe,
- rozbudowany panel producenta,
- CMS dla treści i SEO,
- dalsza automatyzacja raportów i leadów.

## Stack technologiczny

- Next.js 16
- React 19
- TypeScript
- PostgreSQL
- Drizzle ORM
- Supabase
- Vercel
- PDFKit
- Resend
- Stripe
- Tailwind CSS

## Uruchomienie lokalne

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja środowiska

Projekt wymaga połączenia z PostgreSQL.

Minimalnie:

```env
DATABASE_URL=postgresql://...
```

Pozostałe zmienne środowiskowe zależą od używanych modułów, np. płatności, mailingu, cronów i adresu aplikacji.

### 3. Start środowiska developerskiego

```bash
npm run dev
```

Aplikacja będzie dostępna pod:

```
http://localhost:3000
```

### 4. Build

```bash
npm run build
```

### 5. Typecheck

```bash
npm run typecheck
```

### 6. Testy

```bash
npm test
```

## Baza danych

Schemat Drizzle znajduje się w:

```
src/db/schema.ts
```

Migracje:

```
drizzle/
```

Konfiguracja Drizzle:

```
drizzle.config.ts
```

## Najważniejsze obszary projektu

```
src/app/
├── producenci/            # katalog i profile firm
├── wyszukaj/              # wyszukiwarka
├── zapytania-ofertowe/    # formularz RFQ
├── dodaj-producenta/      # onboarding firmy
├── cennik/                # pakiety
├── admin/                 # panel administracyjny
└── api/                   # API, płatności, raporty, cron

src/lib/
├── packagePlans.ts        # centralna konfiguracja pakietów
├── rfqActions.ts          # obsługa RFQ i matching
├── supplierTaxonomy.ts    # taksonomia
└── ...

src/db/
└── schema.ts
```

## Deployment

Projekt jest wdrażany na Vercel.

Branch produkcyjny:

```
main
```

Commity na `main` uruchamiają deployment produkcyjny.

Dodatkowo projekt posiada kontrolę builda w GitHub Actions.

## Status projektu

PolskiEMS jest aktywnie rozwijany.

Aktualny nacisk rozwojowy:

1. kompletność danych producentów,
2. RFQ i automatyczne dopasowanie,
3. onboarding firm,
4. pakiety i raportowanie,
5. sourcing i matchmaking B2B.

## Strona

https://polskiems.vercel.app

## Repozytorium

Projekt prywatny — rozwijany jako PolskiEMS.
