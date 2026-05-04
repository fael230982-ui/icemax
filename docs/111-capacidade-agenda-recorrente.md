# 111 - Capacidade Da Agenda Recorrente

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Controlar a capacidade operacional dos contratos recorrentes antes de aceitar novas vendas ou reagendar preventivas.

## Endpoint

`GET /contracts/capacity-board`

## O que o board mostra

- Total de visitas preventivas planejadas.
- Visitas proximas e atrasadas.
- Capacidade semanal de visitas.
- Capacidade semanal por quantidade de equipamentos.
- Semanas saudaveis, em atencao ou acima da capacidade.
- Visitas criticas que exigem confirmacao ou OS preventiva.

## Painel web

O painel principal ganhou a secao `Capacidade da agenda recorrente`, com filtro para semanas criticas e leitura rapida de carga semanal.

## Uso operacional

Este board ajuda a decidir quando abrir agenda extra, acionar tecnico terceirizado, confirmar janelas com antecedencia ou segurar novas vendas ate equilibrar a capacidade.
