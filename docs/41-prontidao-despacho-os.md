# Prontidao De Despacho Da OS

## Objetivo

Evitar deslocamento improdutivo verificando se uma OS esta pronta para o tecnico sair.

## Endpoint

```http
GET /dispatch/service-orders/1048/readiness?technicianUserId=tech-001
```

## Verificacoes

- localizacao recente do tecnico;
- deslocamento estimado;
- pecas provaveis para o tipo de problema;
- consulta ao manual tecnico;
- alerta de historico/prioridade do cliente.

## Status

- `ready`: pode despachar.
- `attention`: pode despachar com acompanhamento do gestor.
- `blocked`: precisa corrigir pendencia antes de enviar o tecnico.

## Valor Operacional

Esse fluxo reduz:

- visita sem peca;
- deslocamento desnecessario;
- atraso em urgencias;
- retrabalho;
- conclusoes incompletas da OS.

