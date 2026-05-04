# Gate De Isolamento Multiempresa

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

O gate de isolamento multiempresa impede que a plataforma ICEMAX seja virada para banco real sem uma leitura clara dos riscos de separacao entre empresas, clientes, tecnicos, documentos, cobrancas e comunicacoes.

Esse controle e essencial para o modelo whitelabel: a mesma base do produto deve atender ICEMAX e outras empresas futuramente, sem mistura de dados entre tenants.

## Endpoint

`GET /database/tenant-isolation-gate`

O endpoint retorna:

- modo atual da API;
- tenant padrao configurado;
- permissao ou bloqueio para cutover produtivo;
- resumo de dominios prontos, parciais e bloqueados;
- regras minimas de isolamento;
- proximos bloqueios que devem ser removidos;
- lista detalhada de gates por dominio.

## Regras Minimas

1. Toda consulta produtiva deve receber `tenantId` pelo contexto autenticado.
2. Nenhum endpoint publico pode acessar dados financeiros sem token persistido, expiravel e auditavel.
3. Arquivos, fotos, plantas, manuais e assinaturas devem usar storage privado separado por tenant.
4. Qualquer job de agenda, cobranca ou notificacao deve registrar `tenantId`, usuario de origem e idempotencia.

## Estado Atual

Dominios como multiempresa e clientes ja estao proximos da prontidao para Prisma. Ordens e contratos estao parciais porque dependem de assinatura, fotos, aceite e cobranca persistidos. Estoque, portal do cliente, comunicacao e documentos seguem bloqueados para producao ate receberem persistencia e controles de acesso completos.

## Uso No Console

O console operacional consulta esse gate junto dos demais checks de virada para banco. Assim, a homologacao consegue enxergar rapidamente se a base esta pronta para operar como whitelabel real ou se ainda existe risco de cruzamento de dados.
