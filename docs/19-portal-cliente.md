# Portal Do Cliente

## Objetivo

O cliente pode abrir uma ordem de servico quando a empresa permitir, mas isso nao deve ser obrigatorio. A empresa tambem pode continuar abrindo OS internamente pelo painel.

## Implementacao Atual

Rotas adicionadas:

- `GET /customer-portal/:tenantSlug/config`;
- `POST /customer-portal/service-orders`.

O endpoint publico recebe nome, contato, endereco, tipo de equipamento, descricao do problema, urgencia e aceite opcional de WhatsApp.

## Fluxo Operacional

1. Cliente envia solicitacao.
2. Sistema cria OS aberta para triagem.
3. Empresa confirma dados, agenda tecnico e define prioridade final.
4. Cliente pode receber acompanhamento por e-mail ou WhatsApp quando as integracoes forem ativadas.

## Cuidados

- Evitar pedir dados desnecessarios.
- Validar telefone e e-mail antes de usar em notificacoes.
- Aplicar protecao contra spam antes de publicar em producao.
- Manter identidade visual por tenant no whitelabel.
