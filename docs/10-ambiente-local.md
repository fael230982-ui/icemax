# Ambiente Local

## Requisitos

- Node.js 22 ou superior.
- npm.
- Docker Desktop, quando for usar PostgreSQL local.

## Instalar Dependencias

```bash
npm install
```

## Banco Local

```bash
docker compose up -d postgres
```

Variavel esperada:

```bash
DATABASE_URL="postgresql://icemax:icemax@localhost:5432/icemax"
```

## Comandos De Validacao

```bash
npm run db:generate
npm run typecheck
npm run build -w apps/web
npm audit --omit=dev
```

## Aplicacoes

API:

```bash
npm run dev:api
```

Painel web:

```bash
npm run dev:web
```

App tecnico:

```bash
npm run dev:mobile
```
