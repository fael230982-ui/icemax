# Preparo Inteligente Da Visita

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Este bloco cria o pacote de preparo da visita antes do tecnico sair para a OS.

A funcao e reduzir deslocamento improdutivo, falta de peca, falta de acesso, erro de prioridade e ausencia de contexto tecnico.

## API

Endpoint criado:

- `POST /dispatch/visit-preparation`

Entrada:

- `serviceOrderId`
- `technicianUserId`
- `includeVisualDiagnosis`
- `includeCustomerPortalEvidence`

Saida:

- status do preparo
- decisao de despacho
- rota e tecnico
- checklist da visita
- pecas provaveis
- diagnostico assistido
- notas do gestor
- proximas acoes para mobile, comunicacao e estoque

## Regras

- Se houver peca provavel indisponivel, o pacote bloqueia o despacho.
- OS emergencial ou checks em atencao exigem aprovacao gerencial.
- Diagnostico assistido e anexos do portal entram como apoio, nao como conclusao tecnica final.
- O tecnico ainda deve registrar fotos, pecas usadas, medicoes e relatorio revisado.

## Proximos Passos

- Sincronizar o pacote com o app mobile em modo offline.
- Reservar pecas no estoque real.
- Enviar aviso automatico ao cliente quando o despacho for liberado.
- Recalcular rota automaticamente em caso de atraso ou emergencia nova.
