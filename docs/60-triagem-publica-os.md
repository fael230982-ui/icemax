# Triagem Publica De OS

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

Este bloco adiciona uma camada de triagem para solicitacoes abertas pelo portal publico do cliente.

O objetivo e separar uma solicitacao simples de uma emergencia real antes de comprometer agenda, tecnico, rota e estoque.

## API

Endpoint criado:

- `POST /customer-portal/triage`

Entrada principal:

- `tenantSlug`
- `equipmentType`
- `problemDescription`
- `urgency`
- `hasLeak`
- `hasElectricalRisk`
- `hasCriticalEnvironment`
- `hasPhoto`

Saida:

- `suggestedPriority`
- `serviceType`
- `score`
- `requiredChecklist`
- `customerGuidance`
- `dispatchGuidance`
- `communication`

## Integracao Com Abertura De OS

O endpoint `POST /customer-portal/service-orders` agora devolve o pacote `triage` junto com o protocolo mock.

Isso permite que o painel, o portal e a fila de comunicacao usem a mesma leitura operacional da solicitacao.

## Regras

- Risco eletrico, ambiente critico ou termos de emergencia elevam a prioridade para `emergency`.
- Vazamento, falta de refrigeracao, congelamento, alarme ou urgencia alta elevam para `high`.
- Sem sinais criticos, a prioridade permanece `normal`.
- Emergencias exigem revisao de supervisor antes do despacho.

## Proximos Passos

- Persistir resultado da triagem em banco real.
- Permitir upload de fotos pelo portal publico.
- Usar IA real para enriquecer a classificacao quando `OPENAI_API_KEY` estiver configurada.
- Alimentar agenda inteligente e fila de WhatsApp com o resultado da triagem.
