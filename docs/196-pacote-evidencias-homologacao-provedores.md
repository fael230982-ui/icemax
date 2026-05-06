# Pacote De Evidencias De Homologacao De Provedores

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento integra a documentacao operacional do projeto ICEMAX e deve ser mantido com autoria preservada.

## Endpoint

`GET /integrations/provider-homologation-evidence-pack`

## Objetivo

Organizar as evidencias minimas para homologar e-mail, WhatsApp, mapas e OpenAI antes de liberar qualquer trafego real.

## Cenarios

- Relatorio final e garantia por e-mail.
- Agendamento e ETA por WhatsApp.
- Rota e despacho por mapas.
- Revisao de texto e diagnostico assistido por OpenAI.

## Evidencias Obrigatorias

- Amostra de requisicao sem segredo.
- Amostra de resposta sem dado sensivel.
- Evento de auditoria com payload hash.
- Snapshot de custo por tenant.
- Prova de rollback ou fallback manual.
- Aceite LGPD e consentimento aplicavel.

## Bloqueios

- Aprovar provedor sem pacote de evidencias.
- Anexar segredo em evidencia.
- Aprovar WhatsApp sem opt-in.
- Aprovar IA sem amostra de mascaramento.
- Aprovar mapas sem snapshot de custo.
