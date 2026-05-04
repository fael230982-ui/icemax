# 57 - Link Compartilhavel De OS

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Gerar um pacote de link publico controlado para o cliente acompanhar a OS por WhatsApp ou e-mail, com validade, token e regras claras de privacidade.

## Entregas

- Endpoint `POST /customer-portal/service-orders/:id/tracking-link`.
- Token mock opaco para acompanhamento.
- URL publica de acompanhamento.
- Validade de 7 dias.
- Mensagens prontas para WhatsApp e e-mail.
- Auditoria de criacao do link.
- Console web com botao `Link acompanhamento`.

## Seguranca

- O link nao exige login nesta fase mock, mas usa token opaco.
- O token deve ser persistido e validado no banco real antes de producao.
- O link deve expirar automaticamente.
- O link pode ser revogado.
- Dados financeiros, notas internas e telefone pessoal do tecnico ficam ocultos.

## Proximos Passos

- Persistir tokens publicos no PostgreSQL.
- Trocar token mock por token criptograficamente seguro.
- Criar pagina visual publica para o link.
- Enviar link pela fila de comunicacao.
- Auditar abertura e expirar link apos prazo configurado.
