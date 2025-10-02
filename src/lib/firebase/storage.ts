// const STORAGE_EMULATOR_URL = "http://localhost:9199/storage/v1/b";
const STORAGE_EMULATOR_URL = "http://localhost:9199/v0/b";
const BUCKET_NAME = "constituency-data";

export async function listFilesWithDepth(prefix: string, maxDepth: number = 1): Promise<string[]> {
  const encodedPrefix = encodeURIComponent(prefix);
  const url = `${STORAGE_EMULATOR_URL}/${BUCKET_NAME}/o?prefix=${encodedPrefix}&delimiter=/`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to list files: ${res.status} ${res.statusText}`);

  const data = await res.json();
  let files: string[] = [];

  // objects/files returned by the emulator
  if (data.items) {
    data.items.forEach((item: any) => {
      const relativePath = decodeURIComponent(item.name);
      const depth = relativePath.split('/').length - prefix.split('/').length;
      if (depth <= maxDepth) files.push(relativePath);
    });
  }

  // "folders" (prefixes) returned by the delimiter param
  if (data.prefixes && maxDepth > 1) {
    for (const p of data.prefixes) {
      const nestedFiles = await listFilesWithDepth(p, maxDepth - 1);
      files = files.concat(nestedFiles);
    }
  }

  return files;
}

// Fetch a file by path
export async function fetchFile(path: string): Promise<Uint8Array> {
  const encodedPath = encodeURIComponent(path);
  const url = `${STORAGE_EMULATOR_URL}/${BUCKET_NAME}/o/${encodedPath}?alt=media`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Example: fetch all files in a directory
export async function fetchAllFilesInDir(prefix: string, maxDepth = 1): Promise<Record<string, Uint8Array>> {
  const files = await listFilesWithDepth(prefix, maxDepth);
  const results: Record<string, Uint8Array> = {};

  for (const file of files) {
    results[file] = await fetchFile(file);
  }

  return results;
}
