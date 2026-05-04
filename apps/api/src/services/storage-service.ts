import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const workspaceRoot = join(process.cwd(), "..", "..");
const storageRoot = process.env.STORAGE_LOCAL_PATH ?? join(workspaceRoot, "storage");
const storageMode = process.env.STORAGE_DRIVER ?? "local";

const storageFolders = [
  {
    folder: "uploads",
    label: "Uploads gerais",
    sensitivity: "internal",
    retention: "ate vinculacao a uma entidade operacional",
    productionRequirement: "classificar entidade, tenantId e usuario de origem",
  },
  {
    folder: "manuals",
    label: "Manuais tecnicos",
    sensitivity: "internal",
    retention: "enquanto houver equipamento ou versao ativa",
    productionRequirement: "controle de versao, fonte e permissao por tenant",
  },
  {
    folder: "signatures",
    label: "Assinaturas digitais",
    sensitivity: "restricted",
    retention: "prazo contratual e garantia",
    productionRequirement: "storage privado, trilha de auditoria e hash do arquivo",
  },
  {
    folder: "floor-plans",
    label: "Plantas e mapas internos",
    sensitivity: "restricted",
    retention: "enquanto o cliente mantiver contrato ativo",
    productionRequirement: "download autenticado e segregacao por cliente/tenant",
  },
  {
    folder: "reports",
    label: "Relatorios e comprovantes",
    sensitivity: "confidential",
    retention: "prazo fiscal, garantia e historico de OS",
    productionRequirement: "assinatura, versionamento e envio auditavel",
  },
  {
    folder: "qr-labels",
    label: "Etiquetas QR",
    sensitivity: "internal",
    retention: "enquanto o equipamento existir",
    productionRequirement: "payload nao deve expor dados sensiveis sem token",
  },
];

export type StoredFile = {
  path: string;
  url: string;
};

export async function saveLocalFile(params: {
  folder: string;
  fileName: string;
  content: string | Buffer;
}) {
  const relativePath = join(params.folder, params.fileName).replaceAll("\\", "/");
  const absolutePath = join(storageRoot, relativePath);

  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, params.content);

  return {
    path: absolutePath,
    url: `/files/${relativePath}`,
  } satisfies StoredFile;
}

export function getStorageRoot() {
  return storageRoot;
}

export function getStorageReadiness() {
  const privateRequired = storageFolders.filter((item) => item.sensitivity === "restricted" || item.sensitivity === "confidential");
  const localMode = storageMode === "local";

  return {
    generatedAt: new Date().toISOString(),
    mode: storageMode,
    root: storageRoot,
    productionReady: !localMode && Boolean(process.env.STORAGE_PRIVATE_BUCKET),
    summary: {
      folders: storageFolders.length,
      privateRequired: privateRequired.length,
      blockedForProduction: localMode ? privateRequired.length : 0,
    },
    publicAccessPolicy: {
      default: "deny",
      localDevelopment: "permitido somente para ambiente de desenvolvimento",
      production: "downloads devem passar por autenticacao, token expiravel ou URL assinada",
    },
    requiredEnvironment: [
      "STORAGE_DRIVER",
      "STORAGE_PRIVATE_BUCKET",
      "STORAGE_PUBLIC_BUCKET opcional para ativos nao sensiveis",
      "STORAGE_SIGNED_URL_SECRET ou provedor equivalente",
    ],
    folders: storageFolders,
    blockers: localMode
      ? [
          "STORAGE_DRIVER ainda esta em modo local.",
          "Fotos, assinaturas, plantas e relatorios precisam de storage privado antes de producao.",
          "URLs publicas devem ser substituidas por URLs assinadas ou endpoints autenticados.",
        ]
      : [],
  };
}
