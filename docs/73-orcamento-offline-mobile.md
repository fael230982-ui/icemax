# Orcamento Offline No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Permitir que o tecnico apresente o orcamento ao cliente em campo e registre essa etapa mesmo sem conexao.

## App Mobile

A tela de campo passa a exibir:

- numero do orcamento;
- valor total;
- link de aprovacao;
- validade;
- consequencia da aprovacao ou recusa.

## Acao Offline

O app cria uma acao pendente para `POST /service-orders/:id/notes` registrando que o link de aprovacao foi apresentado ao responsavel no local.

## Proximos Passos

- exibir QR Code do link de aprovacao no app;
- permitir aceite local quando autorizado;
- sincronizar decisao real pelo endpoint de orcamento;
- anexar comprovante de aceite ao historico da OS.
