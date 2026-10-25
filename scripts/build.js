import { mkdir, copyFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, "public");
const dest = path.join(root, "dist");
await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
for (const file of ["index.html", "styles.css", "script.js", "favicon.svg"]) {
  await copyFile(path.join(src, file), path.join(dest, file));
}
console.log("Static production bundle generated in dist/");
