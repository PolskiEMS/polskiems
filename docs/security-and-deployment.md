# Bezpieczeństwo i wdrożenie

## MANUAL ACTION REQUIRED

Po wdrożeniu właściciel musi ręcznie:

1. zmienić `ADMIN_PASSWORD` i ustawić silny `ADMIN_USERNAME` w środowiskach Vercel;
2. wygenerować niezależny `ADMIN_SESSION_SECRET` (minimum 32 znaki, zalecane `openssl rand -base64 48`);
3. ocenić rotację danych `DATABASE_URL`, ponieważ dane dostępowe były historycznie commitowane;
4. ustawić wszystkie wartości opisane w `.env.example` w Vercel, bez commitowania plików `.env`;
5. rozważyć uzgodnione z właścicielem usunięcie historycznych sekretów z historii Git — ta zmiana celowo nie przepisuje historii;
6. zastosować migrację `drizzle/0001_query_indexes_and_required_service.sql` kontrolowanym narzędziem migracyjnym najpierw na stagingu, a następnie na produkcji. Migracja dodaje wymagany rekord systemowy i indeksy pod filtry, relacje oraz statystyki; aplikacja nie uruchamia jej automatycznie.

## MANUAL ACTION REQUIRED: Cloudflare

Challenge przeglądarki nie jest generowany przez aplikację. W panelu Cloudflare należy sprawdzić:

- Bot Fight Mode;
- reguły WAF;
- Browser Integrity Check;
- reguły Managed Challenge;
- reguły dla prawidłowo zweryfikowanego Googlebota;
- anonimowy dostęp crawlerów do `/robots.txt` i `/sitemap.xml`;
- czy challenge nie obejmuje całego anonimowego ruchu ani legalnych crawlerów.

## PostgreSQL / Supabase

`DATABASE_URL` powinien wskazywać transakcyjny Supabase pooler przeznaczony dla ruchu serverless, z hostem i portem podanym przez panel projektu, a nie bezpośrednie połączenie wymagające trwałej sesji. Aplikacja używa małego, reużywanego poola na ciepłą instancję Vercel, wymusza SSL i szybko przerywa nieudane zestawianie połączenia.

## Kontrola jakości

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```
