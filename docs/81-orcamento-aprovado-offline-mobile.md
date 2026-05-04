# Orcamento Aprovado Offline No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Levar para o aplicativo tecnico a diferenca entre orcamento apenas apresentado e orcamento aprovado para execucao.

## App Mobile

- Nova secao: `Orcamento liberado`.
- Cards com OS, pecas, despacho, cliente e auditoria.
- Botao offline: `Orcamento liberado`.

## Acao Offline

- Endpoint alvo: `POST /quotes/:id/approval-activation`
- Registra confirmacao mobile de que o tecnico recebeu a liberacao.

## Proximo Encaixe

Persistir a confirmacao no banco real e sincronizar com a reserva de pecas e o despacho tecnico.
