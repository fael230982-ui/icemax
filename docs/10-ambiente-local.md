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
```

Ou tudo junto:

```bash
npm run validate
```

Auditoria de producao:

```bash
npm run audit:prod
```

Auditoria completa, incluindo dependencias de desenvolvimento e opcionais:

```bash
npm run audit:full
```

Observacao: ferramentas como Expo e Next podem trazer dependencias transitivas que aparecem no `npm audit`. Antes de release, a auditoria completa deve ser revisada e resolvida ou justificada.

## Migrations E Seed

Depois que o PostgreSQL local estiver rodando:

```bash
npm run db:migrate
npm run db:seed
```

O seed cria dados ficticios da ICEMAX para desenvolvimento:

- tenant ICEMAX;
- usuario dono;
- tecnico;
- cliente;
- endereco;
- equipamento;
- OS;
- contrato recorrente;
- peca e estoque;
- checklist;
- manual;
- integracoes pendentes.

## Aplicacoes

API:

```bash
npm run dev:api
```

Painel web:

```bash
npm run dev:web
```

Quando o painel consumir a API local:

```bash
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

App tecnico:

```bash
npm run dev:mobile
```
