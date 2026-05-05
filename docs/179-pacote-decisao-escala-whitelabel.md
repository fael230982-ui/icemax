# Pacote De Decisao De Escala Whitelabel

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento descreve o pacote de decisao que define se o whitelabel pode escalar para uma segunda empresa apos o ciclo D30 do primeiro tenant.

## Endpoint

`GET /platform/mobile-offline-escalations/whitelabel-scale-decision`

O endpoint consolida gates, opcoes de decisao, acoes bloqueadas e proximas acoes. Por padrao, a escala permanece bloqueada ate existirem evidencias reais e aprovacao formal.

## Gates

- Health score minimo.
- Acoes corretivas fechadas.
- Custos reais aprovados.
- Modelo de suporte aprovado.
- Aprovacao executiva para escala.

## Opcoes De Decisao

- Escalar: bloqueado ate todos os gates ficarem prontos.
- Prorrogar hypercare: permitido quando ainda existem pendencias corrigiveis.
- Bloquear oferta whitelabel: permitido quando a operacao ainda nao tem estabilidade comprovada.

## Acoes Bloqueadas

- Assinar contrato do segundo tenant.
- Ativar branding de parceiro.
- Ativar contas de provedores de parceiro.
- Anunciar release publico whitelabel.

## Uso Operacional

Antes de qualquer nova empresa usar o aplicativo, a ICEMAX deve consolidar evidencias D30, fechar acoes corretivas, aprovar custos reais e registrar a decisao assinada por RAFAEL DA SILVA BEZEERA.
