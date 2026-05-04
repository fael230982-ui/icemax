import type { ImproveTechnicalTextInput, SuggestIssueCausesInput, VisualDiagnosisPackageInput } from "../schemas";

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

export function createVisualDiagnosisPackage(input: VisualDiagnosisPackageInput) {
  const base = suggestIssueCauses({
    description: `${input.description} ${input.symptoms.join(" ")}`,
    photoHints: input.photoHints,
    equipmentType: input.equipmentType,
  });
  const haystack = `${input.description} ${input.photoHints.join(" ")} ${input.symptoms.join(" ")}`.toLowerCase();
  const hasElectricalRisk = ["faisca", "curto", "disjuntor", "queimado", "fumaca"].some((term) => haystack.includes(term));
  const hasLeak = ["vaz", "agua", "dreno", "gote"].some((term) => haystack.includes(term));
  const hasFrozenCoil = ["gelo", "congel", "serpentina"].some((term) => haystack.includes(term));
  const likelyParts = [
    hasElectricalRisk ? "capacitor, placa eletronica, terminal eletrico ou disjuntor" : null,
    hasLeak ? "bomba de dreno, mangueira, bandeja ou isolamento termico" : null,
    hasFrozenCoil ? "filtro, sensor de temperatura, motor ventilador ou fluido refrigerante" : null,
    haystack.includes("nao gela") || haystack.includes("refrigeracao") ? "fluido refrigerante, valvula de servico ou compressor" : null,
  ].filter(Boolean);

  return {
    provider: "local_rules",
    serviceOrderId: input.serviceOrderId,
    equipmentType: input.equipmentType,
    status: "diagnosis_package_ready",
    evidence: {
      description: input.description,
      photoHints: input.photoHints,
      symptoms: input.symptoms,
      photoCount: input.photoHints.length,
    },
    likelyCauses: base.suggestions,
    riskFlags: [
      hasElectricalRisk ? "risco_eletrico" : null,
      hasLeak ? "vazamento_ou_dreno" : null,
      hasFrozenCoil ? "serpentina_congelada" : null,
    ].filter(Boolean),
    likelyParts: likelyParts.length ? likelyParts : ["pecas a definir apos medicoes de campo"],
    fieldTests: [
      "Comparar temperatura de retorno e insuflamento.",
      "Verificar filtros, serpentina, turbina e vazao de ar.",
      "Inspecionar dreno, bandeja e isolamento quando houver agua.",
      "Medir tensao, corrente e capacitor quando houver sintoma eletrico.",
      "Registrar fotos antes/depois e conclusao tecnica revisada.",
    ],
    safetyGuidance: hasElectricalRisk
      ? "Orientar cliente a manter o equipamento desligado ate avaliacao do tecnico."
      : "Manter area acessivel e equipamento identificado para vistoria.",
    disclaimer: "Diagnostico preliminar para apoiar o tecnico. A causa final depende de medicoes e inspecao presencial.",
  };
}
