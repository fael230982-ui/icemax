# Comunicacao De Deslocamento

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Preparar a comunicacao enviada quando o tecnico aceita a atribuicao e esta pronto para sair em rota, sem depender ainda de WhatsApp, e-mail ou mapas reais.

## Entregas

- Endpoint `GET /dispatch/service-orders/:id/departure-communication`.
- Previa de mensagem para WhatsApp.
- Previa de e-mail para cliente.
- Comunicacao interna para gestor/operacao.
- Regras de privacidade e preflight antes do envio real.
- Botao `Aviso deslocamento` no painel web.

## Regras Operacionais

- Cliente so deve ser avisado quando a prontidao nao estiver bloqueada.
- WhatsApp exige opt-in antes de disparo real.
- A mensagem ao cliente nao expõe telefone pessoal do tecnico, margem interna ou observacoes sensiveis.
- OS com prioridade emergencial ou prontidao em atencao pode exigir aprovacao do gestor.
- O pacote prepara a comunicacao, mas nao dispara canal externo nesta fase.

## Proximo Passo Natural

Conectar esse pacote a provedores reais de e-mail, WhatsApp, push e tracking quando as chaves de integracao forem criadas.
