import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "README.md",
  "CHECKLIST.md",
  "CHANGELOG.md",
  "LICENSE",
  ".env.example",
  ".gitignore",
  ".github/workflows/validate.yml",
  ".github/pull_request_template.md",
  ".github/ISSUE_TEMPLATE/bug_report.md",
  ".github/ISSUE_TEMPLATE/feature_request.md",
  "docs/36-publicacao-github.md",
  "docs/37-protecao-segredos.md",
  "apps/api/package.json",
  "apps/web/package.json",
  "apps/mobile/package.json",
  "packages/database/package.json",
  "packages/shared/package.json",
];

const requiredScripts = [
  "validate",
  "guard:secrets",
  "db:generate",
  "typecheck",
  "test",
  "dev:api",
  "dev:web",
  "dev:mobile",
];

const requiredChecklistTerms = [
  "Registro De Governanca GitHub E Publicacao",
  "Registro De Protecao Contra Segredos",
  "Push inicial enviado ao GitHub",
];

const requiredEnvNames = [
  "DATABASE_URL",
  "JWT_SECRET",
  "API_DATA_SOURCE",
  "NEXT_PUBLIC_API_URL",
  "OPENAI_API_KEY",
  "MAPS_API_KEY",
  "WHATSAPP_ACCESS_TOKEN",
  "EMAIL_API_KEY",
];

function readText(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function pass(label, detail = "") {
  return { status: "pass", label, detail };
}

function fail(label, detail = "") {
  return { status: "fail", label, detail };
}

function warn(label, detail = "") {
  return { status: "warn", label, detail };
}

const packageJson = JSON.parse(readText("package.json"));
const checklist = readText("CHECKLIST.md");
const envExample = readText(".env.example");
const workflow = readText(".github/workflows/validate.yml");
const gitignore = readText(".gitignore");

const checks = [];

for (const file of requiredFiles) {
  checks.push(existsSync(file) ? pass(`Arquivo obrigatorio: ${file}`) : fail(`Arquivo obrigatorio ausente: ${file}`));
}

for (const script of requiredScripts) {
  checks.push(
    packageJson.scripts?.[script]
      ? pass(`Script npm disponivel: ${script}`)
      : fail(`Script npm ausente: ${script}`),
  );
}

for (const term of requiredChecklistTerms) {
  checks.push(
    checklist.includes(term)
      ? pass(`Checklist contem: ${term}`)
      : fail(`Checklist nao contem: ${term}`),
  );
}

for (const envName of requiredEnvNames) {
  checks.push(
    envExample.includes(`${envName}=`)
      ? pass(`Variavel documentada em .env.example: ${envName}`)
      : fail(`Variavel ausente em .env.example: ${envName}`),
  );
}

checks.push(
  workflow.includes("npm run validate")
    ? pass("CI executa npm run validate")
    : fail("CI nao executa npm run validate"),
);

checks.push(
  gitignore.includes(".env") && gitignore.includes("!.env.example")
    ? pass(".gitignore protege .env e permite .env.example")
    : fail(".gitignore precisa proteger .env e permitir .env.example"),
);

checks.push(
  checklist.includes("- [ ] Push inicial pendente")
    ? warn("Push inicial ainda pendente", "Esperado ate o Rafael autorizar o envio para o GitHub.")
    : pass("Push inicial nao esta mais pendente"),
);

const summary = checks.reduce(
  (acc, check) => {
    acc[check.status] += 1;
    return acc;
  },
  { pass: 0, warn: 0, fail: 0 },
);

console.log("# ICEMAX Project Readiness");
console.log("");
console.log(`Pass: ${summary.pass}`);
console.log(`Warn: ${summary.warn}`);
console.log(`Fail: ${summary.fail}`);
console.log("");

for (const check of checks) {
  const marker = check.status === "pass" ? "OK" : check.status === "warn" ? "WARN" : "FAIL";
  console.log(`- [${marker}] ${check.label}${check.detail ? ` - ${check.detail}` : ""}`);
}

if (summary.fail > 0) {
  process.exit(1);
}
