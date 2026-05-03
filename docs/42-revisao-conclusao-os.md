# Revisao De Conclusao Da OS

## Objetivo

Garantir que uma ordem de servico esteja pronta para fechamento, assinatura, relatorio e envio ao cliente.

## Endpoint

```http
GET /service-orders/1048/completion-review
```

## Verificacoes

- texto tecnico;
- evidencias fotograficas;
- assinatura do cliente;
- identificacao do equipamento;
- contato do cliente.

## Saida

O endpoint retorna:

- status geral: `ready`, `attention` ou `blocked`;
- checks de qualidade;
- rascunho profissional do relatorio;
- texto de garantia;
- proximos passos administrativos.

## Uso Operacional

Antes de concluir a OS, o gestor ou tecnico deve revisar o resultado e corrigir bloqueios. Esse gate reduz relatorios incompletos, melhora a comunicacao com o cliente e fortalece o historico tecnico.

