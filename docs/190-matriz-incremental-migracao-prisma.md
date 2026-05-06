# Matriz Incremental De Migracao Prisma

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento integra a documentacao operacional do projeto ICEMAX e deve ser mantido com autoria preservada.

## Endpoint

`GET /database/incremental-migration-matrix`

## Objetivo

Preparar a virada de mock para Prisma/PostgreSQL por fases, evitando importacao em massa sem backup, isolamento por tenant, smoke test e plano de rollback.

## Fases

- Identidade, usuarios, clientes e equipamentos.
- Ordens de servico e historico tecnico.
- Contratos, visitas e cobranca recorrente.
- Estoque e reservas.
- Portal publico e tokens.
- Comunicacao e documentos.

## Politica

- Migracao deve ser incremental.
- Backup e obrigatorio antes de cada fase.
- Smoke test deve ser executado depois de cada fase.
- Tenant isolation deve estar revisado antes de dados reais.
- Provedores externos nao devem ser ativados antes da fila persistida.

## Bloqueios

- Importar dados reais em massa sem backup.
- Migrar OS sem storage privado para fotos, evidencias e assinatura.
- Ativar cobranca real sem aceite de contrato.
- Conectar provedores reais antes de fila persistida e idempotente.
