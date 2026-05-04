# 53 - Comunicacao Operacional

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Conectar OS, contrato, financeiro e canais de contato em um pacote operacional pronto para futura integracao real com e-mail, WhatsApp e notificacoes internas.

## Entregas

- Endpoint `GET /service-orders/:id/communication-package`.
- Endpoint `GET /contracts/:id/communication-package`.
- Pacote de OS com relatorio tecnico, copia opcional ao cliente, resumo WhatsApp, aviso interno, anexos e regras LGPD.
- Pacote de contrato com cobranca mensal, lembrete de visita preventiva, handoff financeiro, regras de automacao e bloqueios.
- Console web com botoes `Comunicacao OS` e `Comunicacao contrato`.
- Teste automatizado cobrindo canais, templates e evento de auditoria planejado.

## Uso Operacional

Na conclusao da OS, o pacote indica o que deve ser enviado para a empresa, o que pode ir em copia ao cliente e quais anexos precisam existir antes do disparo. Para contrato recorrente, o pacote prepara lembretes de cobranca, lembretes de visita e avisos internos ao financeiro.

## Governanca

O envio real ainda depende das chaves de provedores externos, mas a regra de negocio ja fica pronta: consentimento para WhatsApp, base LGPD, politica de reenvio e motivos de bloqueio. Isso reduz retrabalho quando a integracao com Meta, SMTP ou provedor transacional for ativada.

## Proximos Passos

- Persistir pacotes enviados em banco real.
- Criar fila transacional para disparo assicrono.
- Integrar provedor de e-mail.
- Integrar WhatsApp Cloud API ou provedor homologado.
- Exibir historico de envio dentro da OS e do contrato.
