# Relatório de Testes

Data: 26/10/2026 | Sprint 9 (testes, qualidade e estabilidade) | Commit: pendente de push

## Sprint 9 — Suíte automatizada

### Framework

- Unit/integração: **Vitest 5** + **React Testing Library** + **jsdom** (`vitest.config.mts`, setup em `src/test/setup.ts`)
- E2E: **Playwright 1.64** (Chromium; projetos `desktop` e `mobile`, servidor via `build + start`)
- CI: **GitHub Actions** (`.github/workflows/ci.yml`)

### Execução final (resultados reais)

| Gate | Comando | Resultado |
|------|---------|-----------|
| install | `npm ci` | PASS (lockfile consistente) |
| typecheck | `npm run typecheck` | PASS (tsc --noEmit, sem erros) |
| lint | `npm run lint` | PASS (No ESLint warnings or errors) |
| unit/integração | `npm run test` | PASS — **167 testes / 19 arquivos** |
| coverage | `npm run test:coverage` | PASS — thresholds 70/60/70/70 atendidos |
| build | `npm run build` | PASS |
| E2E | `npm run test:e2e` | PASS — **31 testes** (26 desktop + 5 mobile) |
| quality | `npm run quality` | PASS (typecheck && lint && test && build) |
| smoke produção | `node scripts/smoke-production.mjs` | PASS — 6/6 rotas HTTP 200 |

### Cobertura (arquivos alvo: `src/lib/**`, `src/components/**`, `src/app/api/**`)

| Métrica | Valor | Meta |
|---------|-------|------|
| statements | 77,94% | ≥ 70% |
| branches | 67,12% | ≥ 60% |
| functions | 82,95% | ≥ 70% |
| lines | 82,47% | ≥ 70% |

### Escopo dos testes (167)

- **Lib puras (73)**: `parseBRL` (matriz BR/US da Seção 6), `formatBRLTrack`, `discountPct`, `appendPrice`, `tracksOnTarget`, `totalSavings`, preferências, `format*`, `timeAgo` (fake timers), cache TTL, radares, reconciliação offline-first/nuvem (idempotência, soft delete, guard sem credencial).
- **API routes (21)**: `/api/vagas` (live/demo/dedupe/Adzuna com e sem chave), `/api/clima` (Open-Meteo mockado, timeout, fallback demo), `/api/mercado` (AwesomeAPI/Frankfurter/CoinGecko mockados), `/api/noticias` (sem chave → demo, sem rede, chave nunca exposta).
- **SSRF (4)**: guarda estática — nenhuma route busca URL do usuário; hosts em allowlist; `http://` proibido; `file://`/`ftp://`/localhost ausentes.
- **Componentes/UI (27)**: Button (type default), Card, Badge, SectionHeader, RadarForm, RadarCard, ModulePage, AppShell/Header, NotificationsBell, ServiceWorkerRegister.
- **Páginas (38)**: dashboard, sidebar/mobile-nav (10 rotas obrigatórias), /esportes (abas Hoje/Amanhã/Em alta), /ferramentas (IMC, conversor, desconto), /precos (CRUD + validação).
- **Auth (8)**: anônimo, loading, demo, login/logout/signup/rename por comportamento (localStorage), erro fora do provider.
- **Cron/rate limit**: NÃO APLICÁVEL (nenhum endpoint interno com `CRON_SECRET` ou rate limit existe no repositório).

### E2E (31)

- `home.spec.ts`: render do dashboard, títulos, captura de `pageerror`.
- `navigation.spec.ts`: 9 rotas com HTTP 200 + navegação via sidebar.
- `prices.spec.ts`: form, seed, adição manual, validação de envio vazio.
- `sports.spec.ts`: 3 abas, troca de conteúdo, sem erros de página.
- `tools.spec.ts`: IMC 80/1,80 → 24.7; conversor com `page.route` (sem API externa real); desconto.
- `mobile.spec.ts` (Pixel 5): menu/drawer, 4 rotas sem overflow horizontal.

### Bugs de produto encontrados e corrigidos pela suíte

1. `parseBRL` não aceitava formato US (`1899.90`, `1,899.90`) nem rejeitava negativos.
2. `totalSavings` somava o preço do mock (`priceAlertMock`) ao economia do usuário.
3. `Button` sem `type="button"` default (submit implícito em formulários).
4. **Conversor de moeda sempre exibia R$ 0,00**: `rates` indexado por id minúsculo (`usd`) contra `currency` maiúsculo (`USD`).

## Auditoria anterior (Sprint 8) — Gates 4 e 5

| Suíte | Comando | Resultado | Notas |
|-------|---------|-----------|-------|
| typecheck | `tsc --noEmit` | PASS | sem erros |
| lint | `next lint` | PASS | "No ESLint warnings or errors" |
| build | `next build` | PASS | rotas geradas, sem erro de webpack |
| smoke local | `next start` + HTTP | PASS | /esportes 200, /ferramentas 200 |
| unit / E2E | Sprint 9 | **PASS** | item 28 fechado |

### Gate 5 — Segurança

- Segredos no código: não — busca por `sbp_`, `eyJhbGci`, `app_key=` e `api_key=` em `src/` = 0 ocorrências
- Credenciais: Supabase/anon via env; token Supabase só em Credential Manager (não versionado)
- `.env.example` sem valores reais
- `.gitignore` cobre `.env*`, `coverage/`, `playwright-report/`, `test-results/`
- Testes rodam sem `NEWS_API_KEY`, `ADZUNA_*`, `SUPABASE_*` (CI sem secrets)

### Achados

1. ~~Item 28 (testes automatizados) único FAIL~~ — **fechado na Sprint 9**.
2. Itens 20–24, 26–27, 30–31 não auditáveis: texto do master prompt não está no repositório.
3. Itens 14–19, 25, 29: PASS (evidências abaixo).

### Evidências por item (auditoria anterior)

- 14 Esportes abas: `src/components/dashboard/SportsCard.tsx` (role=tablist, aria-selected, 3 abas)
- 15 Calendário 21 MAI: `src/components/dashboard/CalendarCard.tsx` (badge 21/MAI + 3 compromissos)
- 16 Radar de Hoje 5 cards: `src/components/dashboard/RadarToday.tsx` + `radarTodayMock` r1–r5
- 17 Rotas com conteúdo: `/esportes` e `/ferramentas` funcionais (be62171)
- 18 Mobile: `src/components/layout/MobileNav.tsx` (drawer + bottom nav) — coberto por `tests/e2e/mobile.spec.ts`
- 19 Logo/favicon: `Logo.tsx`, `public/favicon.svg`, `public/icons/*`, metadata em `layout.tsx`
- 25 README: 262 linhas
- 29 Aceite: placeholder exato do header, saudação dinâmica, 9 cards do painel
