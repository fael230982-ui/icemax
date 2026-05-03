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

Se Docker nao estiver instalado, use temporariamente um PostgreSQL hospedado, como Neon, Supabase, Railway ou outro provedor compativel, e configure `DATABASE_URL`.

Variavel esperada:

```bash
DATABASE_URL="postgresql://icemax:icemax@localhost:5432/icemax"
```

Para usar API com banco real:

```bash
API_DATA_SOURCE="prisma"
DEFAULT_TENANT_ID="tenant-icemax"
```

Para continuar usando dados mockados:

```bash
API_DATA_SOURCE="mock"
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

Com banco remoto, os mesmos comandos funcionam desde que `DATABASE_URL` esteja configurada no ambiente.

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

Login de desenvolvimento criado pelo seed:

- E-mail: `adm.rcsolutions@gmail.com`
- Senha: `icemax-dev-123`

Essa senha e apenas para ambiente local e deve ser trocada antes de qualquer homologacao real.

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

## PDFs Da Documentacao

Sempre que documentos em `docs/` forem criados ou atualizados:

```bash
npm run docs:pdf
```

Os arquivos PDF ficam em `docs-pdf/`.

## Arquivos Locais Da API

Durante desenvolvimento, relatorios e uploads podem ser salvos em:

```bash
storage/
```

Variavel:

```bash
STORAGE_LOCAL_PATH="./storage"
```

Em producao, essa camada deve ser substituida por armazenamento S3 compativel.
