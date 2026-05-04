# Reserva Operacional De Pecas

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Este bloco conecta o preparo da visita ao controle de pecas e estoque.

A meta e reduzir deslocamento sem material, organizar carregamento do veiculo e disparar compra quando a OS pode consumir item critico.

## API

Endpoint criado:

- `POST /service-orders/:id/parts-reservation`

Entrada:

- `technicianUserId`
- `sourceLocation`
- `targetLocation`
- `requestedSkus`

Saida:

- status da reserva;
- itens solicitados e reservados;
- faltas;
- alerta de estoque minimo;
- movimentacoes planejadas;
- sugestoes de compra;
- impacto no despacho.

## Regras

- Se `requestedSkus` nao for informado, o sistema usa pecas provaveis pelo problema da OS.
- Falta de peca bloqueia o despacho.
- Estoque abaixo do minimo gera sugestao de compra.
- Toda movimentacao ainda e mock; no banco real ela deve virar reserva transacional.

## Proximos Passos

- Persistir reservas no banco real.
- Baixar estoque somente na conclusao ou consumo confirmado da OS.
- Permitir transferencia entre almoxarifado, veiculo e tecnico terceirizado.
- Mostrar pecas reservadas no app mobile antes do deslocamento.
