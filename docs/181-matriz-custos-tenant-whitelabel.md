# Matriz De Custos Por Tenant Whitelabel

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento descreve a matriz de custos por tenant whitelabel. A matriz existe para impedir que uma empresa parceira use chaves, contas ou custos da ICEMAX sem separacao e aprovacao.

## Endpoint

`GET /platform/mobile-offline-escalations/whitelabel-tenant-cost-matrix`

O endpoint retorna centros de custo, tetos mensais em reais, politicas de faturamento, acoes bloqueadas e proximas acoes.

## Centros De Custo

- Mapas e rotas.
- E-mail transacional.
- WhatsApp/Meta.
- IA para texto, foto e diagnostico.
- Armazenamento de fotos, assinaturas e relatorios.

## Politica De Custo

- Rastrear custo por tenant.
- Nao compartilhar cartoes ou chaves entre tenants.
- Exigir aprovacao mensal do dono.
- Desligar automaticamente recursos que ultrapassarem teto aprovado.

## Acoes Bloqueadas

- Usar chaves da ICEMAX para parceiro.
- Ativar provedor pago sem teto.
- Ocultar custo de provedor do dono.
- Cobrar parceiro sem demonstrativo de custos.

## Uso Operacional

Antes de qualquer novo tenant, os provedores pagos devem ter teto mensal, dono de aprovacao e isolamento de chaves. O custo por OS e por modulo deve ser revisado mensalmente.
