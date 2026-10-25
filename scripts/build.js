import { mkdir, copyFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, "public");
const destination = path.join(root, "dist");
const assets = ["index.html", "styles.css", "script.js", "favicon.svg"];

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

for (const asset of assets) {
  await copyFile(path.join(source, asset), path.join(destination, asset));
}

console.log(`Production site built in dist/ (${assets.length} assets).`);
