# Prontidao De Dados Para Prisma

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Organizar a transicao do modo mock para banco real com Prisma, evitando migrar todos os dominios ao mesmo tempo sem controle de risco.

## Endpoint

`GET /database/data-readiness-board`

O endpoint retorna:

- modo atual e modo alvo;
- prontidao media dos dominios;
- dominios de alto risco;
- cobertura de repositorios;
- bloqueios por dominio;
- sequencia recomendada de migracao;
- regras de governanca.

## Sequencia Recomendada

1. Multiempresa.
2. Clientes.
3. Ordens de servico.
4. Contratos.
5. Estoque.
6. Portal do cliente.
7. Comunicacao.
8. Documentos.

## Regras

- Nao fazer virada para producao sem backup.
- Validar cada dominio apos migracao.
- Revisar isolamento por tenant antes de expor dados reais.
- Persistir tokens e filas antes de conectar provedores externos.

## Console

O console operacional passou a consultar este board no check `Virada para banco`, junto com plano de cutover, schema, seed e checklist de ambiente.
