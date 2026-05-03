import type { ImproveTechnicalTextInput, SuggestIssueCausesInput } from "../schemas";

const causeRules = [
  { keywords: ["congel", "gelo", "serpentina"], cause: "baixa vazao de ar, filtro obstruido ou baixa carga de fluido refrigerante" },
  { keywords: ["vaz", "dreno", "agua"], cause: "dreno obstruido, bandeja desnivelada ou isolamento inadequado" },
  { keywords: ["nao liga", "desarma", "disjuntor"], cause: "falha eletrica, capacitor, placa ou protecao por sobrecorrente" },
  { keywords: ["nao gela", "pouco gas", "refrigeracao"], cause: "baixa carga de fluido, vazamento, serpentina suja ou compressor com rendimento baixo" },
  { keywords: ["barulho", "vibr"], cause: "fixacao inadequada, turbina desbalanceada ou rolamento com desgaste" },
];

export function improveTechnicalText(input: ImproveTechnicalTextInput) {
  const cleaned = input.text.trim().replace(/\s+/g, " ");
  const prefix = input.tone === "customer_friendly"
    ? "Foi identificado durante o atendimento que"
    : "Durante a avaliacao tecnica, foi identificado que";
  const outputText = `${prefix} ${cleaned}. Recomenda-se registrar fotos, medicoes e proximas acoes para manter o historico do equipamento completo.`;

  return {
    provider: "local_rules",
    inputText: input.text,
    outputText,
    tone: input.tone,
  };
}

export function suggestIssueCauses(input: SuggestIssueCausesInput) {
  const haystack = `${input.description} ${input.photoHints.join(" ")}`.toLowerCase();
  const matched = causeRules
    .filter((rule) => rule.keywords.some((keyword) => haystack.includes(keyword)))
    .map((rule) => rule.cause);
  const suggestions = matched.length
    ? matched
    : ["necessario complementar diagnostico com medicoes eletricas, temperatura de insuflamento, retorno e inspecao visual"];

  return {
    provider: "local_rules",
    equipmentType: input.equipmentType,
    suggestions: suggestions.map((suggestion, index) => ({
      rank: index + 1,
      cause: suggestion,
      confidence: matched.length ? "medium" : "low",
    })),
    recommendedChecks: [
      "registrar fotos antes e depois",
      "medir temperatura de retorno e insuflamento",
      "verificar filtros, serpentina e dreno",
      "registrar tensao, corrente e estado eletrico quando aplicavel",
    ],
  };
}
