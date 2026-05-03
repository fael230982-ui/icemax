# ICEMAX

Plataforma whitelabel para gestao de ordens de servico, inicialmente focada em empresas de manutencao, instalacao e higienizacao de ar-condicionado.

## Objetivo

Centralizar app tecnico, painel web, API, banco de dados, documentacao de produto, governanca de release e prototipos em um unico monorepo.

## Estrutura

- `docs/`: documentacao de produto, arquitetura, roadmap e regras.
- `docs-pdf/`: copias antigas em PDF; novas geracoes estao adiadas para ganhar velocidade.
- `design/`: identidade visual, referencias e tokens de interface.
- `apps/api/`: API Fastify, regras de negocio, modulos operacionais e integracoes.
- `apps/web/`: painel web Next.js para gestao, despacho, diagnostico e homologacao.
- `apps/mobile/`: aplicativo Expo/React Native para tecnicos e operacao em campo.
- `apps/painel-prototipo/`: prototipo estatico inicial.
- `packages/database/`: Prisma, schema, seed e ponte para PostgreSQL.
- `packages/shared/`: tipos e contratos compartilhados.
- `.github/`: CI, templates de pull request e templates de issues.

## Desenvolvimento Local

Instalar dependencias:

```bash
npm install
```

Validar projeto:

```bash
npm run validate
```

Executar partes separadas:

```bash
npm run typecheck
npm run test
npm run build -w apps/web
```

Banco local:

```bash
docker compose up -d postgres
npm run db:migrate
npm run db:seed
```

Painel e API em desenvolvimento:

```bash
npm run dev:api
npm run dev:web
```

Aplicativo mobile:

```bash
npm run dev:mobile
```

## Escopo Principal

- OS completa com assinatura, relatorio e envio por e-mail.
- Portal opcional para cliente abrir OS.
- Agenda inteligente, despacho, rotas e localizacao de tecnicos.
- Contratos recorrentes com ciclos de 3, 4 e 6 meses.
- Controle de pecas, estoque, compras, garantias e faturamento.
- Historico por cliente, equipamento e contrato.
- Manuais tecnicos, QR labels e mapas/planta de equipamentos.
- IA assistiva para revisao de texto e sugestao de causas provaveis.
- Modo offline no app tecnico.
- Dashboards, KPIs, homologacao, observabilidade e gate de pre-release.
- Multiempresa/whitelabel desde a base.

## Regras Do Projeto

- Projeto proprietario.
- Autoria: RAFAEL DA SILVA BEZEERA.
- Nao publicar segredos, chaves, tokens ou credenciais.
- Revisar texto, acentuacao e experiencia do usuario antes de publicar.
- Atualizar `CHECKLIST.md` antes de push, homologacao e release.
- Atualizar `CHANGELOG.md` em releases relevantes.
- Executar `npm run validate` antes de push, homologacao ou release.

## Decisao De Produto

O produto sera construido como multiempresa desde o primeiro dia. Mesmo que a primeira operacao seja ICEMAX, a base tecnica precisa suportar whitelabel, separacao de dados por empresa, personalizacao de marca e perfis diferentes de usuarios.

## Publicacao

O projeto tem workflow de validacao no GitHub Actions. O primeiro push para `main` deve ser feito somente quando autorizado pelo Rafael e depois de validacao local.
