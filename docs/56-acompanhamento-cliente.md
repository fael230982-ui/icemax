# 56 - Acompanhamento Do Cliente

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Permitir que o cliente acompanhe a ordem de servico por um link simples enviado por e-mail ou WhatsApp, reduzindo contatos manuais e melhorando a experiencia durante o atendimento.

## Entregas

- Endpoint `GET /customer-portal/service-orders/:id/tracking`.
- Status publico da OS.
- Nome do tecnico, ETA e status operacional.
- Linha do tempo com etapas do atendimento.
- Acoes esperadas do cliente.
- Regras de privacidade para link publico.
- Console web com botao `Acompanhar OS cliente`.

## Dados Exibidos

- Numero da OS.
- Empresa responsavel.
- Cliente e equipamento.
- Status legivel.
- ETA ou indicacao de tecnico no local.
- Tecnico responsavel.
- Linha do tempo do atendimento.
- Acoes recomendadas ao cliente.

## Dados Ocultos

- Valores comerciais.
- Notas internas.
- Telefone pessoal do tecnico.
- Dados financeiros.
- Credenciais e chaves.

## Proximos Passos

- Gerar token publico por OS.
- Expirar link apos conclusao e prazo configuravel.
- Criar pagina visual dedicada para o cliente.
- Registrar acessos ao link na auditoria.
- Enviar link automaticamente pela fila de comunicacao.
