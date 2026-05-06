# Selecao De OS Ativa No Mobile

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

Este documento integra a documentacao operacional do projeto ICEMAX e deve ser mantido com autoria preservada.

## Objetivo

Permitir que o tecnico escolha qual ordem de servico esta executando no momento, sem depender de uma missao fixa no aplicativo.

## Entrega

- Cards de OS selecionaveis.
- Destaque visual para a missao ativa.
- Painel de missao atualizado com dados da OS selecionada.
- Acoes rapidas usando o ID da OS ativa.
- Status do app confirmando a troca de missao.

## Regras

- A missao ativa controla check-in, foto inicial, checklist e consumo de peca.
- A fila offline continua registrando prioridade, tentativa e bloqueios.
- A assinatura ainda deve respeitar bloqueios de fechamento antes de producao real.

## Proxima Evolucao

- Persistir a ultima OS ativa selecionada no aparelho.
- Carregar OS atribuida diretamente da API.
- Filtrar OS por tecnico, rota, SLA e prioridade.
- Bloquear troca de OS quando houver pendencia critica sem sincronizar.
