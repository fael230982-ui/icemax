# Acompanhamento Web Validado

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Conectar a pagina publica de acompanhamento da OS ao controle de token publico da API, evitando que a tela mostre dados apenas por inferencia local do formato da URL.

## Fluxo

1. O cliente abre `/acompanhamento/[token]`.
2. A pagina chama `GET /public/customer-portal/tokens/:token/validate?scope=service_order_tracking`.
3. A API valida escopo, tenant e entidade.
4. Se o token for valido, a pagina carrega `GET /customer-portal/service-orders/:id/tracking`.
5. Se o token for invalido, a pagina permanece em estado protegido e nao exibe dados sensiveis.

## Dados Exibidos Quando Valido

- Status da OS.
- Cliente.
- Equipamento.
- Tecnico.
- ETA.
- Linha do tempo.
- Orientacoes ao cliente.
- E-mail de suporte da empresa.

## Protecao Quando Invalido

- Nao exibe equipamento real.
- Nao confirma tecnico real.
- Nao exibe timeline operacional real.
- Mantem mensagem de acompanhamento indisponivel.

## Proximos Passos

- Aplicar o mesmo padrao ao portal financeiro.
- Adicionar tela de link expirado com orientacao de contato.
- Conectar refresh automatico respeitando rate limit.
- Incluir estado visual para link revogado.
