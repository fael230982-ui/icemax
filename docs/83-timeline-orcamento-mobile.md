# Timeline De Orcamento No Mobile

Autor: RAFAEL DA SILVA BEZEERA  
E-mail: adm.rcsolutions@gmail.com  
Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Levar para o app do tecnico a visao resumida da linha do tempo do orcamento aprovado. O tecnico passa a saber se o orcamento foi comunicado, aberto, aprovado e liberado antes de iniciar a execucao.

## Experiencia No App

A nova secao `Timeline do orcamento` exibe cards com:

- Orcamento criado e vinculado a OS.
- Comunicacao preparada por link, e-mail, WhatsApp e aviso interno.
- Portal publico acessado pelo cliente.
- Aceite comercial registrado.
- Execucao liberada para despacho.
- Proximo passo tecnico antes da saida.

## Sincronizacao Offline

O botao `Timeline orcamento` registra uma acao offline em `POST /service-orders/:id/notes`. Isso permite auditar que o tecnico consultou a linha do tempo em campo, mesmo sem conexao no momento.

## Evolucao Recomendada

- Buscar a timeline real em `GET /quotes/:id/approval-timeline` quando o app estiver online.
- Guardar a ultima timeline no cache offline da OS.
- Bloquear check-in quando o orcamento estiver recusado ou pendente.
- Alertar o tecnico quando houver divergencia entre escopo aprovado e checklist executado.
