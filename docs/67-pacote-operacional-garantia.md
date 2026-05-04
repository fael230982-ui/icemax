# Pacote Operacional De Garantia

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Padronizar a garantia emitida apos conclusao da ordem de servico, reduzindo falhas de comunicacao e deixando o pos-atendimento pronto para auditoria.

## Endpoint

`GET /service-orders/:id/warranty-package`

## Conteudo Gerado

- termo de garantia vinculado a OS;
- dias de cobertura sugeridos conforme prioridade da OS;
- texto de cobertura;
- exclusoes operacionais;
- declaracao de ciencia do cliente;
- campos de assinatura digital;
- checks obrigatorios antes do envio;
- mensagens prontas para e-mail e WhatsApp;
- evento de auditoria sugerido.

## Uso Operacional

O gestor consulta o pacote no painel web, confere relatorio tecnico, assinatura, evidencias e rastreabilidade de pecas. Depois disso, o termo pode ser emitido e enviado para o e-mail da empresa, com copia opcional para o cliente.

## Proximos Passos

- persistir o termo real no banco;
- vincular PDF final ao historico da OS;
- permitir assinatura digital no app mobile;
- disparar a fila real de e-mail e WhatsApp quando os provedores forem configurados.
