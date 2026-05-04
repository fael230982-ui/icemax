# Preparo Offline No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Este bloco leva o pacote de preparo da visita para o app mobile do tecnico.

O tecnico passa a ver um resumo operacional antes da execucao e pode salvar uma confirmacao offline de recebimento do preparo.

## Mobile

Foi adicionada a secao `Preparo da visita` com:

- despacho;
- rota;
- pecas provaveis;
- diagnostico;
- seguranca;
- cliente.

O painel de sincronizacao offline recebeu o botao `Preparo visita`.

## Acao Offline

A funcao `createVisitPreparationAckAction` cria uma acao local com:

- `serviceOrderId`;
- `technicianUserId`;
- diagnostico visual habilitado;
- evidencias do portal habilitadas;
- confirmacao offline com horario local.

## Proximos Passos

- Persistir pacote real no armazenamento offline do app.
- Sincronizar pacote recebido com status da OS.
- Exibir pecas provaveis com check de carregamento no veiculo.
- Permitir que o tecnico marque cada item do preparo como conferido.
