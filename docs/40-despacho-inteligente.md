# Despacho Inteligente

## Objetivo

Recomendar o melhor tecnico para cada OS considerando urgencia, localizacao, status operacional e deslocamento estimado.

## Endpoint

```http
GET /dispatch/recommendations
```

Filtro opcional:

```http
GET /dispatch/recommendations?serviceOrderIds=1048,1049,1050
```

## Estrategia Atual

O score considera:

- prioridade da OS;
- status atual do tecnico;
- distancia aproximada entre tecnico e cliente;
- bonus quando o tecnico ja esta vinculado a OS.

Essa primeira versao nao depende de Google Maps. A integracao real com mapas deve substituir a distancia aproximada por tempo de deslocamento em transito real.

## Saida Operacional

Cada OS retorna:

- tecnico recomendado;
- alternativas;
- score;
- tempo estimado;
- motivos da recomendacao.

## Uso No Painel

O console operacional possui o botao `Despacho inteligente`, que mostra as recomendacoes para o gestor.

## Proximos Passos

- considerar competencias do tecnico por tipo de equipamento;
- considerar pecas disponiveis no veiculo;
- considerar janela contratual do cliente;
- enviar confirmacao ao tecnico por push ou WhatsApp.

