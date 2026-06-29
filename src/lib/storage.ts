import { promises as fs } from "fs";
import path from "path";

// Local filesystem storage. Files are written into <appRoot>/uploads/<key>
// and served statically by the web server at /uploads/<key>.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function saveFile(key: string, data: Buffer) {
  const dest = path.join(UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, data);
  return { key };
}

export async function deleteFile(key: string) {
  try {
    await fs.unlink(path.join(UPLOAD_DIR, key));
  } catch {
    // ignore missing files
  }
}

export function getPublicUrl(key: string) {
  return `/uploads/${key}`;
}

export function keyFromUrl(url: string) {
  return url.replace(/^\/uploads\//, "");
}
