# IA Operacional

## Objetivo

A IA deve ajudar o tecnico a escrever melhor, reduzir retrabalho no relatorio e sugerir hipoteses de diagnostico sem substituir a responsabilidade tecnica.

## Implementacao Atual

Foram adicionados endpoints locais:

- `POST /ai/text-improve`;
- `POST /ai/issue-cause-suggestions`.

Neste momento eles usam regras locais, sem custo e sem conta externa.

## Uso Futuro Com OpenAI

Quando a chave OpenAI for configurada, a mesma interface pode chamar um modelo real para:

- revisar texto tecnico;
- padronizar relatorios;
- sugerir causas provaveis;
- gerar resumo da OS;
- sugerir checklist conforme equipamento e problema.

## Regras De Produto

- A IA deve ser assistiva, nunca decisao final automatica.
- O tecnico deve poder editar o texto antes de salvar.
- Fotos e descricoes podem conter dados do cliente; devem respeitar LGPD.
- Toda chamada deve gerar auditoria com fornecedor, tipo de solicitacao e usuario.
