# Planta Operacional

## Objetivo

Transformar a planta do cliente em uma visao operacional acionavel para web e aplicativo.

## Endpoint

```http
GET /floor-plans/floor-001/operational-view
```

## Entrega

O retorno inclui:

- dados da planta;
- resumo de pontos;
- camadas ativas;
- equipamentos posicionados;
- QR Code de cada equipamento;
- manual associado quando identificado;
- ultima OS relacionada;
- risco operacional;
- proximas acoes.

## Valor Para O Produto

Esse bloco prepara o fluxo visual pedido para plantas e localizacao dos equipamentos. A empresa podera clicar em um ponto da planta para abrir detalhe do equipamento, ler QR Code, consultar historico e futuramente abrir OS diretamente dali.

## Proximas Evolucoes

- Editor visual para arrastar pontos na planta.
- Upload real de planta baixa.
- Vinculo com OS aberta em tempo real.
- Camada de sensores e risco.
- Uso no app mobile com leitura de QR e geolocalizacao interna.
