# Pre-Onboarding Do Segundo Tenant Whitelabel

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento descreve o pre-onboarding bloqueado para um candidato a segundo tenant whitelabel. Ele permite preparar a triagem sem coletar credenciais, importar dados reais ou assumir compromisso comercial antes da decisao D30 do primeiro tenant.

## Endpoint

`GET /platform/mobile-offline-escalations/whitelabel-second-tenant-pre-onboarding`

O endpoint retorna secoes de pre-onboarding, politicas de intake, acoes bloqueadas e proximas acoes.

## Secoes

- Triagem comercial.
- Marca, dominio e identidade.
- Contas de provedores por tenant.
- Isolamento de dados.
- Treinamento operacional.

## Politica

- Nao assinar contrato antes da decisao de escala.
- Nao coletar segredos, chaves ou credenciais.
- Nao compartilhar contas de provedores entre tenants.
- Nao compartilhar dados de clientes.
- Exigir aprovacao de RAFAEL DA SILVA BEZEERA.

## Acoes Bloqueadas

- Coletar credenciais do segundo tenant.
- Criar workspace de producao do parceiro.
- Enviar contrato para assinatura.
- Importar base de clientes do parceiro.

## Uso Operacional

Enquanto a ICEMAX estiver em hypercare, qualquer segunda empresa deve permanecer apenas como candidata. A triagem pode levantar contexto comercial e operacional, mas o onboarding real depende do pacote de decisao de escala.
