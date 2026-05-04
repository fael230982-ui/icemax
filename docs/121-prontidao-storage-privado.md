# Prontidao De Storage Privado

Copyright (c) 2026 RAFAEL DA SILVA BEZEERA
All rights reserved.

## Objetivo

O storage da ICEMAX precisa guardar fotos de OS, assinaturas, plantas, manuais, relatorios e etiquetas QR sem expor dados sensiveis. Este documento define a prontidao tecnica para sair do storage local de desenvolvimento e chegar a um storage privado de producao.

## Endpoint

`GET /files/storage-readiness`

O endpoint retorna:

- modo atual do storage;
- raiz local em desenvolvimento;
- status de prontidao para producao;
- pastas conhecidas;
- classificacao de sensibilidade;
- regras de retencao;
- bloqueios para producao;
- variaveis de ambiente esperadas.

## Politica De Acesso

A politica padrao e `deny`. Em producao, downloads de fotos, assinaturas, plantas e relatorios devem passar por autenticacao, token expiravel ou URL assinada.

## Pastas Criticas

- `signatures`: assinaturas digitais, uso restrito.
- `floor-plans`: plantas e mapas internos, uso restrito.
- `reports`: relatorios e comprovantes, uso confidencial.
- `manuals`: manuais tecnicos, uso interno.
- `uploads`: uploads gerais ate classificacao.
- `qr-labels`: etiquetas QR sem dados sensiveis no payload publico.

## Requisitos Para Producao

1. Definir `STORAGE_DRIVER` diferente de `local`.
2. Configurar `STORAGE_PRIVATE_BUCKET`.
3. Separar ativos publicos opcionais em `STORAGE_PUBLIC_BUCKET`.
4. Usar URL assinada ou endpoint autenticado para arquivos sensiveis.
5. Registrar tenantId, usuario, entidade e hash dos arquivos importantes.

## Uso No Console

O console operacional consulta esse endpoint no bloco de homologacao para indicar se arquivos e evidencias podem ser usados com seguranca em ambiente real.
