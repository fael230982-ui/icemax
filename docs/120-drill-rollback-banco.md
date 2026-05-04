# Drill De Rollback Da Virada Para Banco

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

O drill de rollback define como a ICEMAX deve se preparar para sair do modo mock e operar com banco Prisma/PostgreSQL sem perder controle de retorno.

Ele nao executa comandos destrutivos. O endpoint apenas descreve a sequencia, evidencias e gatilhos de rollback para homologacao e tomada de decisao.

## Endpoint

`GET /database/rollback-drill`

O retorno inclui:

- politica de execucao manual;
- `dryRunOnly` ativado;
- etapas de preflight, backup, migration, seed, smoke test e rollback;
- comandos destrutivos bloqueados;
- criterios de go/no-go;
- evidencias exigidas por fase.

## Criterios De Go/No-Go

1. Backup restauravel confirmado antes da migration.
2. Tenant isolation gate sem dominios bloqueados para o escopo ativado.
3. Data readiness board com dominios criticos acima do minimo combinado.
4. Smoke test operacional aprovado apos a virada.

## Comandos Sensíveis

Comandos como `pg_restore --clean --if-exists` aparecem no plano apenas como referencia operacional. Eles exigem aprovacao humana, janela de manutencao e conferencia do banco alvo antes de qualquer execucao.

## Uso No Console

O console operacional consulta o drill dentro do bloco "Virada para banco", junto de cutover, schema, seed, ambiente, readiness e isolamento multiempresa. Isso permite revisar a prontidao antes de alterar qualquer ambiente real.
