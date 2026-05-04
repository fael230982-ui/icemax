# Acompanhamento De Rota

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Criar a base operacional para acompanhar o tecnico entre o aceite da OS e o check-in no cliente, sem depender ainda de Google Maps, push ou WhatsApp real.

## Entregas

- Endpoint `GET /dispatch/service-orders/:id/route-tracking`.
- Snapshot com posicao atual do tecnico.
- Destino da OS, ETA, distancia restante e status da rota.
- Timeline de aceite, aviso ao cliente, saida e check-in.
- Alertas de atraso, urgencia e prontidao em atencao.
- Botao `Acompanhar rota` no painel web.

## Regras Operacionais

- Localizacao real deve depender de consentimento e politica clara para equipe propria e terceirizada.
- Cliente nao deve ver telefone pessoal do tecnico.
- Em atraso ou emergencia, gestor deve acompanhar ate o check-in.
- Quando um provedor real de mapas for configurado, o snapshot mockado pode ser substituido por ETA real.

## Valor Para Prazo

Este bloco antecipa a arquitetura do acompanhamento em tempo real sem gerar custo externo agora. Quando as chaves de mapas forem criadas, a troca sera mais direta.
