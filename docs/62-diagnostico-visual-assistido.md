# Diagnostico Visual Assistido

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Este bloco cria um pacote inicial de diagnostico visual assistido para apoiar o tecnico antes e durante a OS.

Ainda nao usa modelo externo. A implementacao atual usa regras locais para manter o sistema validavel sem chaves de API.

## API

Endpoint criado:

- `POST /ai/visual-diagnosis-package`

Entrada:

- `serviceOrderId`
- `equipmentType`
- `description`
- `photoHints`
- `symptoms`

Saida:

- `likelyCauses`
- `riskFlags`
- `likelyParts`
- `fieldTests`
- `safetyGuidance`
- `disclaimer`

## Uso Operacional

O pacote serve para:

- preparar o tecnico antes do deslocamento;
- indicar pecas provaveis;
- orientar testes de campo;
- alertar risco eletrico, vazamento ou serpentina congelada;
- alimentar a revisao profissional do relatorio.

## Evolucao Com IA Real

Quando a chave OpenAI estiver configurada, este fluxo pode enviar imagens reais e descricao tecnica para um modelo visual.

Mesmo com IA real, o app deve manter:

- aviso de que o diagnostico e preliminar;
- confirmacao presencial por tecnico;
- auditoria do uso da IA;
- ocultacao de dados internos e pessoais.
