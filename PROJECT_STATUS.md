# Status do Projeto
Atualizado: 26/10/2026 (Sprint 9 concluída; `git log` = 7cd4690 + commit Sprint 9)

## Fase atual
Sprint 9 (testes automatizados, quality gates e estabilidade) — **concluída**; item 28 da auditoria fechado.

## Concluído com evidência
- [x] Sprints 1–7 (fundação, auth, APIs ao vivo, radares/alertas, sync nuvem/PWA/Pro, preços, vagas) — commits d75ce97, 39cc84c, 3090c74, 9eb2a0a, ed60226, 0e86970, 373a228, caa8285
- [x] Produção no ar — https://meuradar.vercel.app (smoke 6/6 rotas HTTP 200 em 26/10/2026)
- [x] Supabase prod (profiles, preferences, radars, price_tracks + RLS)
- [x] Quality gates — typecheck/lint/build PASS (última execução 26/10/2026)
- [x] Auditoria itens 14, 15, 16, 18, 19, 25, 29 — PASS (evidência em TEST_REPORT.md)
- [x] Item 17 (rotas com conteúdo) — PASS (be62171)
- [x] **Item 28 (testes automatizados) — PASS (Sprint 9)**: Vitest + RTL + Playwright + CI GitHub Actions + `npm run quality`; 167 unit/integração + 31 E2E, coverage 77.94/67.12/82.95/82.47 (meta 70/60/70/70); CI run 40798039194 = PASS (Node 22)

## Em andamento
- [ ] Itens 20–24, 26–27, 30–31 — não auditáveis sem o texto do master prompt (aguardando usuário)

## Bloqueios
- Chaves Adzuna (ADZUNA_APP_ID/KEY) não fornecidas → vagas BR (InfoJobs/Indeed/Rio) inativas — decisão pendente de: usuário
- NEWS_API_KEY ausente → notícias em modo demo — decisão pendente de: usuário

## Infra de testes (Sprint 9)
- `vitest.config.mts` — jsdom, alias @, setup `src/test/setup.ts`, coverage v8 com thresholds 70/60/70/70
- `playwright.config.ts` — projetos desktop e mobile (Pixel 5), webServer build+start
- `.github/workflows/ci.yml` — Node 22 (zstd exigido por jsdom→undici; `engines >=22.15`), cache npm, npm ci, typecheck, lint, test, coverage, build, e2e (fail fast; run 40798039194 PASS)
- `scripts/smoke-production.mjs` — smoke GET de produção (`npm run smoke:prod`)
- Scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`, `test:e2e:smoke`, `smoke:prod`, `quality`

## Última validação
- Execução em 26/10/2026: `npm ci` PASS; typecheck PASS; lint PASS; test PASS (167); coverage PASS; build PASS; E2E PASS (31); `npm run quality` PASS
- Bugs corrigidos pela suíte: `parseBRL` (formato US/negativos), `totalSavings` (mock no cálculo), `Button` (type default), conversor de moeda (chave USD/usd → R$ 0,00)
- Smoke produção: `/`, `/esportes`, `/ferramentas`, `/precos`, `/vagas`, `/api/vagas` = 200 (26/10/2026)
