# Termos De Garantia

## Objetivo

Gerar termo de garantia vinculado a OS concluida, com cobertura, validade e exclusoes.

## Implementacao Atual

- `POST /warranty-terms`
- Calcula validade conforme dias de cobertura.
- Registra auditoria.

## Proxima Evolucao

Gerar PDF assinado, enviar por e-mail e anexar ao historico do cliente/equipamento.
