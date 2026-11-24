# Backlog
| ID | História | Prioridade | Depto | Status |
|----|----------|------------|-------|--------|
| 1 | Concluir auditoria do master prompt (itens 14–31) | P0 | escritorio-qa | done (14–19,25,29 OK; 17 corrigido; **28 PASS — Sprint 9**) |
| 1b | Itens 20–24, 26–27, 30–31 — dependem do texto do master prompt | P0 | escritorio-cto | blocked |
| 2 | Ativar vagas BR (usuário fornece chaves Adzuna) | P1 | escritorio-integracoes | blocked |
| 3 | Ativar notícias ao vivo (NEWS_API_KEY) | P1 | escritorio-integracoes | done (RSS G1/ge.globo sem chave — Sprint 10) |
| 4 | Páginas restantes reais: /esportes e /ferramentas (itens 17+) | P1 | escritorio-frontend | done (be62171; abas Hoje/Amanhã/Em alta na Sprint 9) |
| 5 | Concursos públicos com fonte/API real | P2 | escritorio-integracoes | done (RSS G1 Trabalho — Sprint 10) |
| 6 | Testes automatizados (unit/E2E) — item 28 do master prompt | P0 | escritorio-qa | **done (Sprint 9: vitest + Playwright + CI + quality)** |
| 7 | Cron/workers para alertas push/WhatsApp | P2 | escritorio-devops | todo |
| 8 | IA e monetização (Pro) | P3 | escritorio-ia | todo |
| 9 | Cobertura de components/auth e components/layout acima de 80% | P2 | escritorio-qa | todo |

## Execução das sprints (23/11/2026)
- **Sprint 10 — CONCLUÍDA**: concursos públicos reais via RSS G1/Trabalho (`/api/concursos`), seção em `/vagas` sem curadoria demo. Itens 3 e 5 fechados.
- **Sprint 11 — CONCLUÍDA**: notificações nativas do navegador para novos alertas dos radares, com permissão explícita e deduplicação (item 7, parte cliente).
- **Sprint 12 — CONCLUÍDA**: 8 testes do AuthProvider com Supabase mockado (sessão, metadata, auth state change, signIn/signUp/signOut/updateName, fallback sem cliente).
- **Sprint 13 — CONCLUÍDA (escopo sem credenciais)**: insights determinísticos sobre dados reais no dashboard (item 8, parte local). IA generativa e cobrança Pro continuam bloqueadas por falta de chaves de LLM/gateway de pagamento.
- Bloqueios remanescentes: itens 1b (master prompt), 2 (chaves Adzuna) e cron server-side push/WhatsApp (credenciais Supabase/WhatsApp).
