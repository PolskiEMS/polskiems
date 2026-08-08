# Środowiska: produkcja i testy

Docelowy podział środowisk:

- `main` → **produkcja** → `polskiems.pl`
- `develop` → **testy (preview/staging)** → `test.polskiems.pl`

## 1) Vercel: mapowanie branchy i domen

1. Wejdź w projekt na Vercel → **Settings → Domains**.
2. Dodaj domeny:
   - `polskiems.pl` (Production)
   - `test.polskiems.pl` (Preview)
3. W **Settings → Git** ustaw:
   - Production Branch: `main`
4. W `test.polskiems.pl` ustaw przypisanie do gałęzi `develop`
   (Domain Assignment / Branch Rule dla Preview).

Efekt:

- każdy deploy z `main` idzie na produkcję,
- każdy deploy z `develop` idzie na środowisko testowe pod `test.polskiems.pl`.

## 2) Osobna baza PostgreSQL/Supabase dla testów

Utrzymujemy dwa niezależne connection stringi:

- produkcja: `DATABASE_URL` wskazuje bazę prod,
- testy: `DATABASE_URL` wskazuje osobny projekt Supabase lub testową bazę PostgreSQL.

Przykładowe URI:

```bash
# produkcja
DATABASE_URL=postgresql://postgres.PROJECT_REF:***@POOLER_HOST:6543/postgres

# testy
DATABASE_URL=postgresql://postgres.TEST_PROJECT_REF:***@POOLER_HOST:6543/postgres
```

## 3) Osobne ENV-y na Vercel

W **Settings → Environment Variables** dodaj komplet zmiennych osobno dla:

- **Production** (dla `main`)
- **Preview** (dla `develop` i pozostałych branchy testowych)

Minimalny zestaw:

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SECRET`
- `CRON_SECRET`
- `RESEND_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_JWKS_URL`

> Uwaga: wartości dla Production i Preview mają być różne (zwłaszcza sekrety i baza).
> Klucz `SUPABASE_SECRET_KEY` należy ustawiać wyłącznie w lokalnym lub wdrożeniowym
> środowisku serwerowym i nigdy nie udostępniać go kodowi klienta ani repozytorium.

## 4) Migracje Drizzle per środowisko

Migracje wykonuj osobno dla prod i test, podając odpowiedni `DATABASE_URL`:

```bash
# test (lokalnie / CI)
DATABASE_URL='postgresql://...' npx drizzle-kit push

# produkcja
DATABASE_URL='postgresql://...' npx drizzle-kit push
```

Dzięki temu schema testowa i produkcyjna nie wpływają na siebie.

## 5) Szybka checklista

- [ ] `main` ustawiony jako Production Branch na Vercel
- [ ] `develop` przypięty do `test.polskiems.pl`
- [ ] osobny projekt Supabase lub baza PostgreSQL dla testów
- [ ] osobny `DATABASE_URL` dla Production i Preview
- [ ] osobne sekrety (`ADMIN_*`, `CRON_SECRET`, `RESEND_API_KEY`) dla Production i Preview
