# Garantia Offline No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Permitir que o tecnico consulte e confirme a garantia da OS mesmo sem internet, mantendo o encerramento do atendimento consistente com o painel web.

## App Mobile

A tela de campo passa a exibir:

- cobertura sugerida;
- exclusoes principais;
- aceite do cliente;
- regra de envio por e-mail.

## Acao Offline

O app cria uma acao pendente para `POST /warranty-terms` com:

- OS;
- cliente;
- dias de cobertura;
- texto resumido de garantia;
- exclusoes;
- confirmacao local de que o termo foi apresentado.

## Proximos Passos

- substituir os dados mockados por pacote vindo da API;
- coletar assinatura desenhada no app;
- anexar assinatura ao relatorio final;
- sincronizar o termo real no banco e na fila de comunicacao.
