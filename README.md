# MeuRadar

**A informação que importa para você, em só um lugar.**

O **MeuRadar** é uma central inteligente de informações úteis do dia a dia: clima, notícias, mercado, preços, vagas, esportes, encomendas, agenda e um feed personalizado ("Seu Radar de Hoje").

Sprint 1 — fundação técnica e visual: dashboard navegável, responsivo, com dados mockados, pronto para deploy.

## Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS 3
- Lucide React (ícones)

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
    ui/                   # Card, Badge, Button, SectionHeader
  data/
    mock.ts               # Dados mockados centralizados
  types/
    index.ts
  lib/
    utils.ts
public/
  favicon.svg
  branding/logo.svg
```

## Módulos atuais (Sprint 1)

- Painel Hoje (`/`) — saudação, Seu Radar de Hoje, clima, mercado, encomendas, preços, vagas, notícias, esportes, calendário
- Meu Radar (`/meu-radar`)
- Clima (`/clima`)
- Notícias (`/noticias`)
- Mercado (`/mercado`)
- Preços (`/precos`)
- Vagas (`/vagas`)
- Esportes (`/esportes`)
- Ferramentas (`/ferramentas`)
- Configurações (`/configuracoes`)

Páginas internas exibem layout consistente + card "Módulo em preparação". Nenhuma API real nesta sprint — tudo mockado em `src/data/mock.ts`.

## Roadmap resumido

- Sprint 2 — Autenticação, perfil e personalização (Supabase)
- Sprint 3 — Integrações reais (clima, notícias, mercado)
- Sprint 4 — Radares personalizados + alertas
- Futuro — MeuRadar Pro, PWA completa, IA e monetização

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
