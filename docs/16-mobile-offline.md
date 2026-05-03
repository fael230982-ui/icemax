# Mobile E Offline

## Objetivo

O app tecnico deve funcionar mesmo quando o tecnico estiver sem internet em cliente, garagem, casa de maquinas ou local com sinal fraco.

## Estrategia Inicial

- Manter uma fila local de acoes pendentes.
- Registrar check-in, checklist, fotos, pecas, notas e assinatura como eventos.
- Enviar a fila quando a conexao voltar.
- Registrar auditoria no back-end para cada acao sincronizada.

## Implementacao Atual

O app mobile possui:

- componente `SyncPanel`;
- servico `apps/mobile/src/services/api.ts`;
- fila em memoria para check-in offline;
- envio para `PATCH /service-orders/:id/status`.

## Proximas Etapas

- Trocar fila em memoria por persistencia local no aparelho.
- Adicionar detector de conectividade.
- Salvar fotos em cache local ate envio.
- Criar tela de conflitos quando uma OS mudar no servidor antes da sincronizacao.
- Garantir que cada acao offline tenha `id` unico para evitar duplicidade.
