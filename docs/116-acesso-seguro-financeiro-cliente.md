# Acesso Seguro Financeiro Do Cliente

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA. All rights reserved.

## Objetivo

Preparar um modelo seguro para o cliente acessar informacoes financeiras do portal sem expor dados internos da empresa nem permitir acesso permanente por link publico.

## Endpoint

`POST /customer-portal/:tenantSlug/billing-access-link`

O endpoint retorna:

- token mock opaco;
- link publico preparado;
- data de emissao e expiracao;
- escopo liberado ao cliente;
- restricoes de informacao;
- canais previstos para envio;
- requisitos de seguranca para producao;
- evento de auditoria.

## Regras

- O link expira automaticamente.
- Em producao, o token deve ser persistido somente como hash.
- O acesso real deve exigir confirmacao de identidade do cliente.
- Cada abertura deve gerar auditoria.
- O link nao permite pagamento, alteracao de contrato ou aceite juridico.

## Portal Web

O componente `PortalBillingSummary` ganhou uma acao para preparar o link seguro. No ambiente atual, a acao cria apenas um pacote mock, sem envio real por e-mail ou WhatsApp.
