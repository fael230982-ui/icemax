# Pacote De Chegada E Check-In

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Conectar o acompanhamento de rota ao inicio real da OS em campo, preparando a validacao de chegada, check-in e abertura segura do checklist tecnico.

## Entregas

- Endpoint `GET /dispatch/service-orders/:id/arrival-checkin`.
- Validacao de proximidade do tecnico em relacao ao cliente.
- Status de liberacao de check-in.
- Gate inicial de checklist com fotos, seguranca e escopo aprovado.
- Visibilidade gerencial sobre chegada e necessidade de override.
- Botao `Pacote chegada` no painel web.

## Regras Operacionais

- Check-in automatico deve respeitar raio aceito e/ou ETA baixo.
- Override manual do gestor deve exigir justificativa.
- Antes de intervir no equipamento, o tecnico deve registrar foto inicial, conferir QR Code e abrir checklist.
- O cliente pode ver chegada, mas nao dados pessoais do tecnico.

## Valor Para Prazo

Este bloco fecha a transicao de despacho para execucao e reduz retrabalho futuro no app mobile, porque os requisitos de check-in ja ficam definidos na API.
