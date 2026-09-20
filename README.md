# MeuRadar

**A informação que importa para você, em só um lugar.**

O **MeuRadar** é uma central inteligente de informações úteis do dia a dia: clima, notícias, mercado, preços, vagas, esportes, encomendas, agenda e um feed personalizado ("Seu Radar de Hoje").

Sprint 1 — fundação técnica e visual: dashboard navegável, responsivo, com dados mockados, pronto para deploy.

Sprint 2 — autenticação, perfil e personalização: Supabase Auth (com fallback demo local), páginas `/login`, `/cadastro`, `/conta`, preferências persistentes e `supabase/schema.sql`.

Sprint 3 — integrações reais: `/api/clima` (Open-Meteo, sem chave), `/api/mercado` (AwesomeAPI, sem chave), `/api/noticias` (NewsAPI opcional) — todas com cache em memória + fallback para `src/data/mock.ts`. Páginas `/clima`, `/mercado`, `/noticias` com badge Ao vivo/Demo, refresh e updatedAt.

Sprint 4 — radares personalizados + alertas: CRUD em `/meu-radar` (8 tipos, seed com 3 exemplos, persistência local), motor `evaluateRadars()` cruzando radares com clima/mercado/mocks, sino de notificações no Header com dropdown + badge, tabela `radars` no Supabase (RLS).

## Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS 3
- Lucide React (ícones)
- Supabase Auth + Postgres (`@supabase/supabase-js`, `@supabase/ssr`)

## Como executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

Scripts:

```bash
npm run lint
npm run typecheck
npm run build
```

## Estrutura do projeto

```txt
src/
  app/
    page.tsx              # Dashboard principal (/)
    meu-radar/page.tsx
    clima/page.tsx
    noticias/page.tsx
    mercado/page.tsx
    precos/page.tsx
    vagas/page.tsx
    esportes/page.tsx
    ferramentas/page.tsx
    configuracoes/page.tsx
    layout.tsx
    globals.css
  components/
    layout/               # Sidebar, Header, MobileNav, AppShell, Logo, ModulePage
    dashboard/            # WeatherCard, MarketCard, NewsCard, PackageCard, ...
    auth/                 # AuthProvider, AuthForm (Sprint 2)
    preferences/          # PreferencesForm (Sprint 2)
    radars/               # RadarForm, RadarCard (Sprint 4)
    notifications/        # NotificationsBell (Sprint 4)
    data/                 # SourceBadge (Sprint 3)
    ui/                   # Card, Badge, Button, SectionHeader
  data/
    mock.ts               # Dados mockados centralizados
  types/
    index.ts              # + AppUser, UserPreferences (Sprint 2)
  lib/
    utils.ts
    supabase.ts           # client browser + isSupabaseConfigured (Sprint 2)
    preferences.ts        # interesses, defaults, localStorage (Sprint 2)
    cache.ts              # cache em memória + fetchWithTimeout (Sprint 3)
    format.ts             # BRL, %, timeAgo (Sprint 3)
    useApi.ts             # hook client p/ API routes (Sprint 3)
    radars.ts             # tipos, CRUD local, evaluateRadars() (Sprint 4)
supabase/
  schema.sql              # profiles + preferences + RLS + trigger (Sprint 2) + radars (Sprint 4)
public/
  favicon.svg
  branding/logo.svg
```

## Módulos atuais (Sprint 1–4)

- Painel Hoje (`/`) — saudação, Seu Radar de Hoje, clima, mercado, encomendas, preços, vagas, notícias, esportes, calendário (mock Sprint 1)
- Meu Radar (`/meu-radar`) — CRUD de radares + alertas avaliados ao vivo (Sprint 4)
- Conta (`/conta`) — perfil + preferências + logout (Sprint 2)
- Login (`/login`) / Cadastro (`/cadastro`) — Supabase ou demo local (Sprint 2)
- Clima (`/clima`) — ao vivo Open-Meteo + fallback demo (Sprint 3)
- Mercado (`/mercado`) — ao vivo AwesomeAPI + fallback demo (Sprint 3)
- Notícias (`/noticias`) — NewsAPI quando há chave + fallback demo (Sprint 3)
- Preços (`/precos`), Vagas (`/vagas`), Esportes (`/esportes`), Ferramentas (`/ferramentas`) — ainda mock/em preparação

## Roadmap resumido

- Sprint 2 — Autenticação, perfil e personalização (Supabase) ✅ CONCLUÍDA
- Sprint 3 — Integrações reais (clima, notícias, mercado) ✅ CONCLUÍDA
- Sprint 4 — Radares personalizados + alertas ✅ CONCLUÍDA
- Sprint 5 — Sync nuvem dos radares, cron/workers, PWA, MeuRadar Pro
- Futuro — IA e monetização

## APIs (Sprint 3)

- Clima: sem chave. `GET /api/clima?city=Rio%20de%20Janeiro` → Open-Meteo (geocoding + forecast), cache 10 min, fallback `weatherMock`.
- Mercado: sem chave. `GET /api/mercado` → AwesomeAPI USD/EUR/BTC-BRL, cache 5 min, Ibovespa segue demo, fallback `marketMock`.
- Notícias: opcional. Sem `NEWS_API_KEY`, `GET /api/noticias` retorna `newsMock` (demo). Com chave da NewsAPI, retorna manchetes BR, cache 15 min.
- Badge “Ao vivo/Demo” + botão Atualizar + timestamp em cada página.

## Supabase (Sprint 2 + 4)

1. Crie um projeto em https://supabase.com/dashboard
2. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. No SQL Editor, execute `supabase/schema.sql` (cria `profiles`, `preferences`, `radars`, RLS e trigger)
4. `npm run dev` — login/cadastro passam a usar o Supabase. Sem env, o app usa demo local (radares em localStorage).

---

## Visão do produto

O **MeuRadar** é uma plataforma web inteligente criada para centralizar informações úteis do dia a dia em um único painel personalizado.

A proposta é simples: reunir, organizar e apresentar ao usuário apenas o que realmente importa para sua rotina, permitindo acompanhar notícias, clima, mercado, preços, oportunidades, encomendas, esportes, agenda e diversos outros serviços em um só ambiente.

O projeto foi pensado para funcionar de forma altamente automatizada, utilizando integrações com APIs, sistemas de monitoramento, inteligência artificial e atualizações em tempo real.

## Objetivo

Transformar o MeuRadar em uma central digital de uso diário, onde cada usuário possa criar seu próprio radar de informações e acompanhar seus principais interesses sem precisar acessar diversos sites diferentes.

O usuário poderá personalizar o painel de acordo com temas como:

* Clima e alertas meteorológicos
* Notícias personalizadas
* Dólar, euro, Bitcoin e mercado financeiro
* Monitoramento de preços
* Promoções e ofertas
* Rastreamento de encomendas
* Vagas de emprego
* Concursos públicos
* Esportes e resultados
* Agenda e lembretes
* Ferramentas online
* Alertas personalizados
* Conteúdo baseado em localização e interesses

## Conceito principal

O MeuRadar não pretende ser apenas um portal de informações.

A plataforma deverá aprender com os interesses do usuário e apresentar um feed personalizado chamado **Seu Radar de Hoje**, concentrando eventos, alertas, oportunidades e informações relevantes em tempo real.

Exemplos:

> Chuva forte prevista para sua região.

> O produto que você acompanha caiu 18% de preço.

> Seu time joga hoje às 21h30.

> Uma nova vaga compatível com seu perfil foi publicada.

> Sua encomenda saiu para entrega.

> O dólar apresentou forte variação hoje.

## Radar Inteligente

Um dos principais recursos da plataforma será o sistema de monitoramento personalizado.

O usuário poderá criar radares como:

* "Notebook gamer abaixo de R$ 4.000"
* "Concursos administrativos no Rio de Janeiro"
* "Passagem Rio de Janeiro para Lisboa abaixo de R$ 2.500"
* "Bitcoin cair mais de 5%"
* "Novas vagas de suporte técnico remoto"
* "Alertas de chuva forte na minha região"

O sistema realizará verificações automaticamente e exibirá alertas quando as condições forem atendidas.

## Monetização

O MeuRadar foi planejado desde o início para permitir múltiplas fontes de receita.

Entre elas:

* Google AdSense
* Programas de afiliados
* Produtos patrocinados
* Empresas parceiras
* Destaques comerciais
* Plano MeuRadar Pro
* Alertas premium
* Recursos avançados de inteligência artificial

## Arquitetura planejada

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* PWA

### Backend

* Node.js
* Next.js API
* PostgreSQL
* Supabase

### Infraestrutura

* Vercel
* Cloudflare
* Workers / Webhooks / Cron Jobs

## Diferencial

Enquanto mecanismos de busca ajudam o usuário a encontrar informações quando ele procura por algo, o MeuRadar acompanha continuamente aquilo que o usuário considera importante.

**"O que eu realmente preciso saber hoje?"**

---

### MeuRadar

**A informação que importa para você, em só um lugar.**
