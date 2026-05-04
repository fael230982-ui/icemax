# Mobile Pacote Offline De OS

## Objetivo

Permitir que o tecnico registre uma execucao completa de OS mesmo sem internet.

## Pacote Offline

O aplicativo mobile agora consegue enfileirar:

- localizacao;
- check-in;
- resposta de checklist;
- foto antes;
- foto depois;
- peca usada;
- assinatura e conclusao da OS.

## Sincronizacao

As acoes ficam em fila local e sao enviadas para a API quando o tecnico aciona a sincronizacao.

Endpoints usados:

- `POST /technicians/:id/location`
- `PATCH /service-orders/:id/status`
- `POST /service-orders/:id/checklist-answers`
- `POST /service-orders/:id/photos`
- `POST /service-orders/:id/parts`

## Valor Para O Produto

Esse bloco aproxima o aplicativo de uma rotina real de campo. O tecnico consegue trabalhar em locais com internet instavel, como casas de maquina, subsolos, areas internas de predios e clientes com baixa cobertura.

## Proximas Evolucoes

- Persistir fila offline no armazenamento local do aparelho.
- Capturar fotos reais pela camera.
- Capturar assinatura desenhada na tela.
- Usar GPS real do dispositivo.
- Sincronizar automaticamente quando a internet voltar.
