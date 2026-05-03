# Riscos Tecnicos

## Auditoria NPM

Status atual:

- `npm run validate` passa por Prisma, typecheck e build do painel web.
- `npm audit` ainda aponta vulnerabilidades moderadas em dependencias transitivas de `next` e `expo`.
- `npm audit fix` sem `--force` nao resolve.
- `npm audit fix --force` sugere mudancas quebraveis e nao deve ser aplicado sem planejamento.

Decisao:

- Nao bloquear desenvolvimento local.
- Antes de homologacao publica ou release, revisar versoes de Next/Expo e resolver auditoria completa.
- Nao publicar producao enquanto a auditoria completa nao estiver resolvida ou formalmente justificada.

## PostgreSQL Local

Status atual:

- Docker nao foi encontrado no ambiente local durante a verificacao.
- Sem Docker ou PostgreSQL instalado, nao e possivel testar migrations/seed localmente agora.

Mitigacao:

- Usar Docker Desktop quando estiver disponivel.
- Ou configurar `DATABASE_URL` com PostgreSQL remoto temporario, como Neon, Supabase ou Railway.
- O codigo segue preparado para `API_DATA_SOURCE="prisma"`.
