# Lembretes De Aprovacao De Orcamento

Autor: RAFAEL DA SILVA BEZEERA  
E-mail: adm.rcsolutions@gmail.com  
Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

O fluxo de lembretes transforma o board de orcamentos em acoes de comunicacao. Ele prepara mensagens para clientes que ainda precisam decidir e avisos internos para orcamentos ja aprovados.

## Endpoint

`POST /quotes/approval-reminders`

O retorno inclui:

- Lembretes prontos em modo mock.
- Canal recomendado.
- Template.
- Destinatario.
- Prioridade.
- Assunto e corpo.
- Preflight de opt-in, margem oculta e provedor pendente.
- Chave de idempotencia para evitar duplicidade.
- Governanca de auditoria.

## Uso No Console Web

O botao `Lembretes orcamento` cria o pacote de lembretes sem enviar mensagens reais. O envio real dependera das chaves de e-mail, WhatsApp e regras de consentimento.

## Cuidados

- Nao enviar WhatsApp sem opt-in do cliente.
- Nao expor margem interna, custo de compra ou dados sensiveis.
- Usar idempotencia para evitar mensagem duplicada.
- Registrar entrega, abertura e decisao na auditoria.

## Evolucao Recomendada

- Conectar provedor real de e-mail.
- Conectar Meta WhatsApp Business.
- Criar politica de intervalo minimo entre lembretes.
- Mostrar status de entrega no board gerencial.
