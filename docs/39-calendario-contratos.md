# Calendario De Contratos Recorrentes

## Objetivo

Dar visibilidade operacional das manutencoes contratadas por cliente, especialmente contratos com recorrencia de 3, 4 ou 6 meses.

## Endpoint

```http
GET /contracts/maintenance-calendar?occurrences=4
```

Parametros:

- `occurrences`: quantidade de visitas futuras por contrato, entre 1 e 24.
- `fromDate`: data base opcional em ISO para classificacao de prazo.

## Classificacao

- `overdue`: visita vencida.
- `due_soon`: visita com vencimento em ate 15 dias.
- `planned`: visita futura fora da janela critica.

## Uso Operacional

O gestor deve usar o calendario para:

- antecipar geracao de OS preventiva;
- confirmar janela com o cliente;
- reservar tecnico e pecas;
- reduzir atraso em contratos fixos;
- alimentar a agenda inteligente.

## Painel

O console operacional possui o botao `Calendario contratos`, que consulta o endpoint e exibe o resumo das proximas visitas.

