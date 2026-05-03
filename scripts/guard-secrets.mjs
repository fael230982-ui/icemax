import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".expo",
  ".tmp-doc-pdf",
  "build",
  "coverage",
  "dist",
  "docs-pdf",
  "node_modules",
  "storage",
  "tmp",
]);

const ignoredFiles = new Set([".env.example", "package-lock.json"]);
const isCi = process.env.GITHUB_ACTIONS === "true";

function listFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

const filesToScan = listFiles(process.cwd());

const blockedEnvFiles = filesToScan.filter((file) => {
  const normalized = file.replace(/\\/g, "/");
  const name = normalized.split("/").pop();
  return isCi && name?.startsWith(".env") && name !== ".env.example";
});

const secretPatterns = [
  { name: "OpenAI API key", regex: /sk-[A-Za-z0-9_-]{20,}/g },
  { name: "GitHub token", regex: /gh[pousr]_[A-Za-z0-9_]{20,}/g },
  { name: "Google API key", regex: /AIza[0-9A-Za-z_-]{20,}/g },
  { name: "Slack token", regex: /xox[baprs]-[A-Za-z0-9-]{20,}/g },
  { name: "Private key block", regex: /-----BEGIN (RSA |EC |OPENSSH |)?PRIVATE KEY-----/g },
  {
    name: "Sensitive assignment with real-looking value",
    regex:
      /\b(?:PASSWORD|SECRET|TOKEN|API_KEY|ACCESS_KEY|DATABASE_URL)\b\s*[:=]\s*["']?(?!$|""|''|trocar-|changeme|example|localhost|http:\/\/localhost|postgresql:\/\/[^"'\s]*localhost|mock|tenant-icemax|icemax-dev)([A-Za-z0-9_./+=:@-]{24,})/gi,
  },
];

const findings = [];

for (const file of filesToScan) {
  const normalized = file.replace(/\\/g, "/");
  const name = normalized.split("/").pop() ?? "";

  if (ignoredFiles.has(name) || (name.startsWith(".env") && name !== ".env.example")) {
    continue;
  }

  if (statSync(file).size > 2_000_000) {
    continue;
  }

  let content = "";

  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  for (const pattern of secretPatterns) {
    pattern.regex.lastIndex = 0;
    const matches = content.match(pattern.regex);

    if (matches?.length) {
      findings.push(`${file}: ${pattern.name}`);
    }
  }
}

if (blockedEnvFiles.length || findings.length) {
  console.error("Secret guard failed.");

  for (const file of blockedEnvFiles) {
    console.error(`- Versioned environment file is not allowed: ${file}`);
  }

  for (const finding of findings) {
    console.error(`- ${finding}`);
  }

  process.exit(1);
}

console.log("Secret guard passed.");
