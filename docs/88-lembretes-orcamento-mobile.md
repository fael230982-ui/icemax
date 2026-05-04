# Lembretes De Orcamento No Mobile

Autor: RAFAEL DA SILVA BEZEERA  
E-mail: adm.rcsolutions@gmail.com  
Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

O mobile agora orienta o tecnico sobre lembretes de orcamento em campo. O foco e registrar que o cliente foi orientado, sem automatizar envio real de WhatsApp ou e-mail pelo app.

## Experiencia No App

A secao `Lembretes de orcamento` mostra:

- Cliente pendente de decisao.
- Aviso interno para orcamento aprovado.
- Evitar duplicidade de mensagens.
- Auditoria de quem apresentou o lembrete.
- Privacidade e ocultacao de margem.
- Proximo passo apos aprovacao ou revisao.

## Sincronizacao Offline

O botao `Lembrete orcamento` gera uma nota offline na OS. Quando sincronizada, essa nota registra o lembrete apresentado pelo tecnico.

## Evolucao Recomendada

- Sincronizar lembretes reais gerados por `POST /quotes/approval-reminders`.
- Exibir status de entrega quando e-mail e WhatsApp estiverem configurados.
- Bloquear envio sem opt-in valido.
- Mostrar historico de lembretes ja apresentados ao cliente.
