import { promises as fs } from "fs";
import os from "os";
import path from "path";

const LOCAL_DIR = path.join(process.cwd(), "data");
const TMP_DIR = path.join(os.tmpdir(), "link-circle-data");

let cachedWritableDir: string | null = null;

/** Prefer repo data/ locally; fall back to /tmp on read-only hosts like Vercel. */
export async function getWritableDataDir(): Promise<string> {
  if (cachedWritableDir) return cachedWritableDir;

  for (const dir of [LOCAL_DIR, TMP_DIR]) {
    try {
      await fs.mkdir(dir, { recursive: true });
      const probe = path.join(dir, `.write-probe-${process.pid}`);
      await fs.writeFile(probe, "ok", "utf8");
      await fs.unlink(probe);
      cachedWritableDir = dir;
      return dir;
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    "Storage is read-only on this host. Run admin locally, or connect a database for production.",
  );
}

export async function readJsonFile<T>(
  filename: string,
  fallback: T,
): Promise<T> {
  const candidates = [
    cachedWritableDir ? path.join(cachedWritableDir, filename) : null,
    path.join(TMP_DIR, filename),
    path.join(LOCAL_DIR, filename),
  ].filter(Boolean) as string[];

  for (const file of candidates) {
    try {
      const raw = await fs.readFile(file, "utf8");
      return JSON.parse(raw) as T;
    } catch {
      // try next
    }
  }

  return fallback;
}

export async function writeJsonFile(filename: string, value: unknown) {
  const dir = await getWritableDataDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, filename),
    JSON.stringify(value, null, 2),
    "utf8",
  );
}
