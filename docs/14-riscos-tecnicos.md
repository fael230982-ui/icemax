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

