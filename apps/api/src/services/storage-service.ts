import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const storageRoot = process.env.STORAGE_LOCAL_PATH ?? join(process.cwd(), "storage");

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
